import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateUserDto) {
    return this.prisma.user.create({
      data: dto
    });
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

  softDelete(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });
  }

  findMany(args?: Prisma.UserFindManyArgs) {
    return this.prisma.user.findMany(args);
  }
}
