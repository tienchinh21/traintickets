import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { CarriageType, Prisma, SeatTypeStatus } from '@prisma/client';
import { getPaginationOffset } from '../../common/utils/pagination.util';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import { SeatQueryDto } from './dto/seat-query.dto';
import { UpdateSeatDto } from './dto/update-seat.dto';

const seatInclude = {
  carriage: {
    select: {
      id: true,
      trainId: true,
      carriageNumber: true,
      name: true,
      carriageType: true,
      status: true
    }
  },
  seatType: true
} satisfies Prisma.SeatInclude;

type SeatWithRelations = Prisma.SeatGetPayload<{
  include: typeof seatInclude;
}>;

@Injectable()
export class SeatsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(carriageId: string, dto: CreateSeatDto) {
    await this.ensureSeatTypeMatchesCarriage(carriageId, dto.seatTypeId);

    await this.prisma.seat.create({
      data: {
        carriageId,
        seatTypeId: dto.seatTypeId,
        seatNumber: dto.seatNumber,
        rowNumber: dto.rowNumber,
        columnNumber: dto.columnNumber,
        floorNumber: dto.floorNumber,
        status: dto.status
      }
    });

    return {
      message: 'Tạo ghế thành công'
    };
  }

  async findMany(carriageId: string, query: SeatQueryDto) {
    await this.ensureCarriageExists(carriageId);

    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const where: Prisma.SeatWhereInput = {
      carriageId,
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.search ? { seatNumber: { contains: query.search } } : {})
    };

    const [seats, total] = await this.prisma.$transaction([
      this.prisma.seat.findMany({
        where,
        include: {
          seatType: true
        },
        orderBy: [{ seatNumber: 'asc' }],
        skip: getPaginationOffset(page, limit),
        take: limit
      }),
      this.prisma.seat.count({ where })
    ]);

    return {
      data: seats.map((seat) => ({
        ...seat,
        seatType: {
          ...seat.seatType,
          baseMultiplier: seat.seatType.baseMultiplier.toString()
        }
      })),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      message: 'Lấy danh sách ghế thành công'
    };
  }

  async findById(id: string) {
    const seat = await this.prisma.seat.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: seatInclude
    });

    if (!seat) {
      throw new NotFoundException('Không tìm thấy ghế');
    }

    return this.serializeSeat(seat);
  }

  async update(id: string, dto: UpdateSeatDto) {
    const currentSeat = await this.findExistingSeat(id);

    if (dto.seatTypeId) {
      await this.ensureSeatTypeMatchesCarriage(
        currentSeat.carriageId,
        dto.seatTypeId
      );
    }

    await this.prisma.seat.update({
      where: { id },
      data: dto
    });

    return {
      message: 'Cập nhật ghế thành công'
    };
  }

  async delete(id: string) {
    await this.findById(id);

    // TODO: Khi có tickets, không cho xóa ghế nếu đã phát sinh ticket.
    await this.prisma.seat.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    return {
      message: 'Xóa ghế thành công'
    };
  }

  private async ensureCarriageExists(carriageId: string) {
    const carriage = await this.prisma.carriage.findFirst({
      where: {
        id: carriageId,
        deletedAt: null
      },
      select: {
        id: true
      }
    });

    if (!carriage) {
      throw new BadRequestException('Toa không tồn tại hoặc đã bị xóa mềm');
    }
  }

  private async ensureSeatTypeMatchesCarriage(
    carriageId: string,
    seatTypeId: string
  ) {
    const carriage = await this.prisma.carriage.findFirst({
      where: {
        id: carriageId,
        deletedAt: null
      },
      select: {
        id: true,
        carriageType: true
      }
    });

    if (!carriage) {
      throw new BadRequestException('Toa không tồn tại hoặc đã bị xóa mềm');
    }

    const seatType = await this.prisma.seatType.findFirst({
      where: {
        id: seatTypeId,
        status: SeatTypeStatus.ACTIVE
      },
      select: {
        id: true,
        name: true,
        allowedCarriageTypes: true
      }
    });

    if (!seatType) {
      throw new BadRequestException('Loại ghế không tồn tại hoặc không ACTIVE');
    }

    const allowedCarriageTypes = this.parseAllowedCarriageTypes(
      seatType.allowedCarriageTypes
    );

    if (!allowedCarriageTypes.includes(carriage.carriageType)) {
      throw new BadRequestException(
        `Loại ghế ${seatType.name} không phù hợp với ${this.getCarriageTypeLabel(carriage.carriageType)}`
      );
    }
  }

  private async findExistingSeat(id: string) {
    const seat = await this.prisma.seat.findFirst({
      where: {
        id,
        deletedAt: null
      },
      select: {
        id: true,
        carriageId: true
      }
    });

    if (!seat) {
      throw new NotFoundException('Không tìm thấy ghế');
    }

    return seat;
  }

  private parseAllowedCarriageTypes(value: Prisma.JsonValue): CarriageType[] {
    if (!Array.isArray(value)) {
      return [];
    }

    return value.filter((item): item is CarriageType =>
      Object.values(CarriageType).includes(item as CarriageType)
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

  private serializeSeat(seat: SeatWithRelations) {
    return {
      ...seat,
      seatType: {
        ...seat.seatType,
        baseMultiplier: seat.seatType.baseMultiplier.toString()
      }
    };
  }
}
