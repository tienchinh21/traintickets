import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionStatus, Prisma } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePermissionDto) {
    await this.ensureCodeIsUnique(dto.code);

    await this.prisma.permission.create({
      data: dto
    });

    return {
      message: 'Tạo quyền thành công'
    };
  }

  findMany(search?: string) {
    const where: Prisma.PermissionWhereInput | undefined = search
      ? {
          OR: [
            { code: { contains: search } },
            { name: { contains: search } },
            { module: { contains: search } }
          ]
        }
      : undefined;

    return this.prisma.permission.findMany({
      where,
      orderBy: [{ module: 'asc' }, { action: 'asc' }, { code: 'asc' }]
    });
  }

  async findById(id: bigint) {
    const permission = await this.prisma.permission.findUnique({
      where: { id }
    });

    if (!permission) {
      throw new NotFoundException('Không tìm thấy quyền');
    }

    return permission;
  }

  async update(id: bigint, dto: UpdatePermissionDto) {
    await this.findById(id);

    if (dto.code) {
      await this.ensureCodeIsUnique(dto.code, id);
    }

    await this.prisma.permission.update({
      where: { id },
      data: dto
    });

    return {
      message: 'Cập nhật quyền thành công'
    };
  }

  async deactivate(id: bigint) {
    await this.findById(id);

    await this.prisma.permission.update({
      where: { id },
      data: {
        status: PermissionStatus.INACTIVE
      }
    });

    return {
      message: 'Vô hiệu hóa quyền thành công'
    };
  }

  private async ensureCodeIsUnique(code: string, excludeId?: bigint) {
    const existingPermission = await this.prisma.permission.findFirst({
      where: {
        code,
        ...(excludeId ? { id: { not: excludeId } } : {})
      },
      select: {
        id: true
      }
    });

    if (existingPermission) {
      throw new AppException(
        'PERMISSION_CODE_DUPLICATED',
        'Mã quyền đã tồn tại',
        undefined,
        [`Mã quyền ${code} đã tồn tại`]
      );
    }
  }
}
