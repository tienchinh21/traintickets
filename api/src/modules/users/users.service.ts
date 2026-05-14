import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RoleStatus, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AppException } from '../../common/exceptions/app.exception';
import { getPaginationOffset } from '../../common/utils/pagination.util';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserQueryDto } from './dto/user-query.dto';

type UserWithRoles = NonNullable<Awaited<ReturnType<UsersService['findById']>>>;
const userInclude = {
  roles: {
    include: {
      role: true
    }
  }
} satisfies Prisma.UserInclude;

type UserRecordWithRoles = Prisma.UserGetPayload<{
  include: typeof userInclude;
}>;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    await this.ensureContactIsValid(dto.email, dto.phone);
    await this.ensureContactIsUnique(dto.email, dto.phone);
    await this.ensureRolesExist(dto.roleIds);

    const passwordHash = await bcrypt.hash(dto.password, 12);
    await this.prisma.user.create({
      data: {
        email: dto.email,
        phone: dto.phone,
        fullName: dto.fullName,
        passwordHash,
        userType: dto.userType,
        status: dto.status,
        roles: dto.roleIds?.length
          ? {
              create: dto.roleIds.map((roleId) => ({
                roleId: BigInt(roleId)
              }))
            }
          : undefined
      }
    });

    return {
      message: 'Tạo người dùng thành công'
    };
  }

  findById(id: string) {
    return this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        roles: {
          include: {
            role: true
          }
        }
      }
    });
  }

  async findDetailById(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: userInclude
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    return this.serializeUser(user);
  }

  findAuthProfileById(id: string) {
    return this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: {
        roles: {
          include: {
            role: {
              include: {
                permissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null
      }
    });
  }

  findByPhone(phone: string) {
    return this.prisma.user.findFirst({
      where: {
        phone,
        deletedAt: null
      }
    });
  }

  findByEmailOrPhone(email?: string, phone?: string) {
    return this.prisma.user.findFirst({
      where: {
        deletedAt: null,
        OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])]
      }
    });
  }

  assignRole(userId: string, roleId: bigint) {
    return this.prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId,
          roleId
        }
      },
      update: {},
      create: {
        userId,
        roleId
      }
    });
  }

  updateLastLoginAt(id: string, lastLoginAt = new Date()) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt }
    });
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findDetailById(id);

    if (dto.email !== undefined || dto.phone !== undefined) {
      await this.ensureContactIsValid(dto.email, dto.phone, id);
      await this.ensureContactIsUnique(dto.email, dto.phone, id);
    }

    await this.ensureRolesExist(dto.roleIds);

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 12)
      : undefined;

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id },
        data: {
          email: dto.email,
          phone: dto.phone,
          fullName: dto.fullName,
          passwordHash,
          userType: dto.userType,
          status: dto.status
        }
      });

      if (dto.roleIds !== undefined) {
        await tx.userRole.deleteMany({
          where: { userId: id }
        });

        if (dto.roleIds.length) {
          await tx.userRole.createMany({
            data: dto.roleIds.map((roleId) => ({
              userId: id,
              roleId: BigInt(roleId)
            })),
            skipDuplicates: true
          });
        }
      }
    });

    return {
      message: 'Cập nhật người dùng thành công'
    };
  }

  async softDelete(id: string) {
    await this.findDetailById(id);

    await this.prisma.user.update({
      where: { id },
      data: {
        status: UserStatus.INACTIVE,
        deletedAt: new Date()
      }
    });

    return {
      message: 'Xóa người dùng thành công'
    };
  }

  async findMany(query?: UserQueryDto | Prisma.UserFindManyArgs) {
    if (!this.isUserQueryDto(query)) {
      return this.prisma.user.findMany(query);
    }

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(query.userType ? { userType: query.userType } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { fullName: { contains: query.search } },
              { email: { contains: query.search } },
              { phone: { contains: query.search } }
            ]
          }
        : {})
    };
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        include: userInclude,
        orderBy: [{ createdAt: 'desc' }],
        skip: getPaginationOffset(page, limit),
        take: limit
      }),
      this.prisma.user.count({ where })
    ]);

    return {
      data: users.map((user) => this.serializeUserSummary(user)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      message: 'Lấy danh sách người dùng thành công'
    };
  }

  private isUserQueryDto(
    query?: UserQueryDto | Prisma.UserFindManyArgs
  ): query is UserQueryDto {
    return (
      !query || !('where' in query || 'include' in query || 'select' in query)
    );
  }

  private async ensureContactIsValid(
    email?: string,
    phone?: string,
    userId?: string
  ) {
    if (email !== undefined || phone !== undefined || !userId) {
      const currentUser = userId
        ? await this.prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, phone: true }
          })
        : null;
      const resolvedEmail = email ?? currentUser?.email;
      const resolvedPhone = phone ?? currentUser?.phone;

      if (!resolvedEmail && !resolvedPhone) {
        throw new AppException(
          'USER_CONTACT_REQUIRED',
          'Email hoặc số điện thoại là bắt buộc',
          400,
          ['Vui lòng nhập email hoặc số điện thoại cho người dùng']
        );
      }
    }
  }

  private async ensureContactIsUnique(
    email?: string,
    phone?: string,
    excludeId?: string
  ) {
    if (email) {
      const existingEmail = await this.prisma.user.findFirst({
        where: {
          email,
          deletedAt: null,
          ...(excludeId ? { id: { not: excludeId } } : {})
        },
        select: { id: true }
      });

      if (existingEmail) {
        throw new AppException(
          'USER_EMAIL_DUPLICATED',
          'Email đã tồn tại',
          400,
          [`Email ${email} đã tồn tại`]
        );
      }
    }

    if (phone) {
      const existingPhone = await this.prisma.user.findFirst({
        where: {
          phone,
          deletedAt: null,
          ...(excludeId ? { id: { not: excludeId } } : {})
        },
        select: { id: true }
      });

      if (existingPhone) {
        throw new AppException(
          'USER_PHONE_DUPLICATED',
          'Số điện thoại đã tồn tại',
          400,
          [`Số điện thoại ${phone} đã tồn tại`]
        );
      }
    }
  }

  private async ensureRolesExist(roleIds?: number[]) {
    if (!roleIds?.length) return;

    const roles = await this.prisma.role.findMany({
      where: {
        id: {
          in: roleIds.map((roleId) => BigInt(roleId))
        },
        status: RoleStatus.ACTIVE
      },
      select: { id: true }
    });
    const foundRoleIds = new Set(roles.map((role) => role.id.toString()));
    const missingRoleIds = roleIds.filter(
      (roleId) => !foundRoleIds.has(roleId.toString())
    );

    if (missingRoleIds.length) {
      throw new AppException(
        'USER_ROLE_NOT_FOUND',
        'Vai trò không hợp lệ',
        400,
        [`Không tìm thấy vai trò đang hoạt động: ${missingRoleIds.join(', ')}`]
      );
    }
  }

  private serializeUser(user: UserWithRoles) {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      userType: user.userType,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
      roles: user.roles.map((userRole) => ({
        id: userRole.role.id,
        code: userRole.role.code,
        name: userRole.role.name,
        status: userRole.role.status
      }))
    };
  }

  private serializeUserSummary(user: UserRecordWithRoles) {
    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.fullName,
      userType: user.userType,
      status: user.status,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      roles: user.roles.map((userRole) => ({
        id: userRole.role.id,
        code: userRole.role.code,
        name: userRole.role.name,
        status: userRole.role.status
      }))
    };
  }
}
