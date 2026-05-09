import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { PermissionStatus, Prisma, RoleStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { SyncRolePermissionsDto } from './dto/sync-role-permissions.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoleDto) {
    await this.prisma.role.create({
      data: dto
    });

    return {
      message: 'Tạo vai trò thành công'
    };
  }

  findMany(search?: string) {
    const where: Prisma.RoleWhereInput | undefined = search
      ? {
          OR: [{ code: { contains: search } }, { name: { contains: search } }]
        }
      : undefined;

    return this.prisma.role.findMany({
      where,
      orderBy: {
        code: 'asc'
      }
    });
  }

  async findById(id: bigint) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (!role) {
      throw new NotFoundException('Không tìm thấy vai trò');
    }

    return role;
  }

  async update(id: bigint, dto: UpdateRoleDto) {
    await this.findById(id);

    await this.prisma.role.update({
      where: { id },
      data: dto
    });

    return {
      message: 'Cập nhật vai trò thành công'
    };
  }

  async deactivate(id: bigint) {
    await this.findById(id);

    await this.prisma.role.update({
      where: { id },
      data: {
        status: RoleStatus.INACTIVE
      }
    });

    return {
      message: 'Vô hiệu hóa vai trò thành công'
    };
  }

  async syncPermissions(id: bigint, dto: SyncRolePermissionsDto) {
    await this.findById(id);

    const permissions = await this.prisma.permission.findMany({
      where: {
        code: {
          in: dto.permissionCodes
        },
        status: PermissionStatus.ACTIVE
      }
    });

    const foundCodes = new Set(
      permissions.map((permission) => permission.code)
    );
    const missingCodes = dto.permissionCodes.filter(
      (code) => !foundCodes.has(code)
    );

    if (missingCodes.length > 0) {
      throw new BadRequestException(
        `Không tìm thấy quyền đang hoạt động: ${missingCodes.join(', ')}`
      );
    }

    await this.prisma.$transaction([
      this.prisma.rolePermission.deleteMany({
        where: { roleId: id }
      }),
      this.prisma.rolePermission.createMany({
        data: permissions.map((permission) => ({
          roleId: id,
          permissionId: permission.id
        })),
        skipDuplicates: true
      })
    ]);

    return {
      message: 'Cập nhật quyền cho vai trò thành công'
    };
  }
}
