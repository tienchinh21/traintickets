import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CarriageType, Prisma } from '@prisma/client';
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
    const searchCarriageType = this.parseCarriageType(query.search);
    const where: Prisma.CarriageWhereInput = {
      trainId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              ...(searchCarriageType
                ? [{ carriageType: searchCarriageType }]
                : [])
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

    if (dto.carriageType) {
      await this.ensureExistingSeatsMatchCarriageType(id, dto.carriageType);
    }

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

  private async ensureExistingSeatsMatchCarriageType(
    carriageId: string,
    carriageType: CarriageType
  ) {
    const seats = await this.prisma.seat.findMany({
      where: {
        carriageId,
        deletedAt: null
      },
      include: {
        seatType: true
      }
    });

    const invalidSeat = seats.find(
      (seat) =>
        !this.parseAllowedCarriageTypes(
          seat.seatType.allowedCarriageTypes
        ).includes(carriageType)
    );

    if (invalidSeat) {
      throw new BadRequestException(
        `Không thể đổi toa sang ${this.getCarriageTypeLabel(carriageType)} vì đang có loại ghế ${invalidSeat.seatType.name} không phù hợp`
      );
    }
  }

  private parseAllowedCarriageTypes(value: Prisma.JsonValue): CarriageType[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is CarriageType =>
      Object.values(CarriageType).includes(item as CarriageType)
    );
  }

  private parseCarriageType(value?: string): CarriageType | undefined {
    if (!value) {
      return undefined;
    }

    const normalizedValue = value.toUpperCase();
    return Object.values(CarriageType).find(
      (carriageType) => carriageType === normalizedValue
    );
  }

  private getCarriageTypeLabel(carriageType: CarriageType) {
    const labels: Record<CarriageType, string> = {
      [CarriageType.SEAT]: 'toa ghế ngồi',
      [CarriageType.SLEEPER]: 'toa giường nằm',
      [CarriageType.VIP]: 'toa VIP'
    };

    return labels[carriageType];
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
