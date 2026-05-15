import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { getPaginationOffset } from '../../common/utils/pagination.util';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateTrainDto } from './dto/create-train.dto';
import { TrainQueryDto } from './dto/train-query.dto';
import { UpdateTrainDto } from './dto/update-train.dto';

const trainDetailInclude = {
  carriages: {
    where: {
      deletedAt: null
    },
    orderBy: {
      carriageNumber: 'asc'
    },
    select: {
      id: true,
      carriageNumber: true,
      name: true,
      carriageType: true,
      status: true,
      createdAt: true,
      updatedAt: true
    }
  }
} satisfies Prisma.TrainInclude;

type TrainRecord = Awaited<ReturnType<PrismaService['train']['findFirst']>>;

@Injectable()
export class TrainsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTrainDto) {
    await this.ensureCodeIsUnique(dto.code);

    await this.prisma.train.create({
      data: dto
    });

    return {
      message: 'Tạo tàu thành công'
    };
  }

  async findMany(query: TrainQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.TrainWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { code: { contains: query.search } },
              { name: { contains: query.search } }
            ]
          }
        : {})
    };

    const [trains, total] = await this.prisma.$transaction([
      this.prisma.train.findMany({
        where,
        orderBy: [{ code: 'asc' }],
        skip: getPaginationOffset(page, limit),
        take: limit
      }),
      this.prisma.train.count({ where })
    ]);

    return {
      data: trains,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      message: 'Lấy danh sách tàu thành công'
    };
  }

  async findById(id: string) {
    const train = await this.prisma.train.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: trainDetailInclude
    });

    if (!train) {
      throw new NotFoundException('Không tìm thấy tàu');
    }

    return train;
  }

  async update(id: string, dto: UpdateTrainDto) {
    await this.findById(id);

    if (dto.code) {
      await this.ensureCodeIsUnique(dto.code, id);
    }

    await this.prisma.train.update({
      where: { id },
      data: dto
    });

    return {
      message: 'Cập nhật tàu thành công'
    };
  }

  async delete(id: string) {
    await this.findExistingTrain(id);

    // TODO: Khi có trips, không cho xóa tàu nếu có trip tương lai đang mở bán.
    await this.prisma.train.update({
      where: { id },
      data: {
        status: 'INACTIVE',
        deletedAt: new Date()
      }
    });

    return {
      message: 'Xóa tàu thành công'
    };
  }

  private async findExistingTrain(
    id: string
  ): Promise<NonNullable<TrainRecord>> {
    const train = await this.prisma.train.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });

    if (!train) {
      throw new NotFoundException('Không tìm thấy tàu');
    }

    return train;
  }

  private async ensureCodeIsUnique(code: string, excludeId?: string) {
    const existingTrain = await this.prisma.train.findFirst({
      where: {
        code,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      },
      select: {
        id: true
      }
    });

    if (existingTrain) {
      throw new AppException(
        'TRAIN_CODE_DUPLICATED',
        'Mã tàu đã tồn tại',
        undefined,
        [`Mã tàu ${code} đã tồn tại`]
      );
    }
  }
}
