import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { getPaginationOffset } from '../../common/utils/pagination.util';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CarriageQueryDto } from './dto/carriage-query.dto';
import { CreateCarriageDto } from './dto/create-carriage.dto';
import { UpdateCarriageDto } from './dto/update-carriage.dto';

const carriageDetailInclude = {
  train: {
    select: {
      id: true,
      code: true,
      name: true,
      status: true
    }
  },
  seats: {
    where: {
      deletedAt: null
    },
    include: {
      seatType: true
    },
    orderBy: {
      seatNumber: 'asc'
    }
  }
} satisfies Prisma.CarriageInclude;

type CarriageWithDetail = Prisma.CarriageGetPayload<{
  include: typeof carriageDetailInclude;
}>;

@Injectable()
export class CarriagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(trainId: string, dto: CreateCarriageDto) {
    await this.ensureTrainExists(trainId);

    await this.prisma.carriage.create({
      data: {
        trainId,
        carriageNumber: dto.carriageNumber,
        name: dto.name,
        carriageType: dto.carriageType,
        seatMapLayout: dto.seatMapLayout as Prisma.InputJsonValue,
        status: dto.status
      }
    });

    return {
      message: 'Tạo toa thành công'
    };
  }

  async findMany(trainId: string, query: CarriageQueryDto) {
    await this.ensureTrainExists(trainId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.CarriageWhereInput = {
      trainId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { carriageType: { contains: query.search } }
            ]
          }
        : {})
    };

    const [carriages, total] = await this.prisma.$transaction([
      this.prisma.carriage.findMany({
        where,
        orderBy: [{ carriageNumber: 'asc' }],
        skip: getPaginationOffset(page, limit),
        take: limit
      }),
      this.prisma.carriage.count({ where })
    ]);

    return {
      data: carriages,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      message: 'Lấy danh sách toa thành công'
    };
  }

  async findById(id: string) {
    const carriage = await this.prisma.carriage.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: carriageDetailInclude
    });

    if (!carriage) {
      throw new NotFoundException('Không tìm thấy toa');
    }

    return this.serializeCarriageDetail(carriage);
  }

  async update(id: string, dto: UpdateCarriageDto) {
    await this.findById(id);

    await this.prisma.carriage.update({
      where: { id },
      data: {
        carriageNumber: dto.carriageNumber,
        name: dto.name,
        carriageType: dto.carriageType,
        seatMapLayout: dto.seatMapLayout as Prisma.InputJsonValue,
        status: dto.status
      }
    });

    return {
      message: 'Cập nhật toa thành công'
    };
  }

  async delete(id: string) {
    await this.findById(id);

    await this.prisma.carriage.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    return {
      message: 'Xóa toa thành công'
    };
  }

  private async ensureTrainExists(trainId: string) {
    const train = await this.prisma.train.findFirst({
      where: {
        id: trainId,
        deletedAt: null
      },
      select: {
        id: true
      }
    });

    if (!train) {
      throw new BadRequestException('Tàu không tồn tại hoặc đã bị xóa mềm');
    }
  }

  private serializeCarriageDetail(carriage: CarriageWithDetail) {
    return {
      ...carriage,
      seats: carriage.seats.map((seat) => ({
        ...seat,
        seatType: {
          ...seat.seatType,
          baseMultiplier: seat.seatType.baseMultiplier.toString()
        }
      }))
    };
  }
}
