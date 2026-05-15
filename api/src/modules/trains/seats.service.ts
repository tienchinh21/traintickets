import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CarriageType,
  Prisma,
  SeatStatus,
  SeatTypeStatus
} from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { getPaginationOffset } from '../../common/utils/pagination.util';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateSeatDto } from './dto/create-seat.dto';
import {
  GenerateSeatsDto,
  SeatLayoutType,
  SeatNumberingMode
} from './dto/generate-seats.dto';
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
    await this.ensureSeatNumberIsUnique(carriageId, dto.seatNumber);

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

  async generate(carriageId: string, dto: GenerateSeatsDto) {
    await this.ensureSeatTypeMatchesCarriage(carriageId, dto.seatTypeId);
    const seats = this.buildGeneratedSeats(dto);

    if (seats.length === 0) {
      throw new AppException(
        'SEAT_GENERATION_EMPTY',
        'Không có ghế nào được sinh',
        undefined,
        ['Layout không sinh ra ghế nào']
      );
    }

    await this.ensureGeneratedSeatsAreUnique(carriageId, seats);

    const status = dto.status ?? SeatStatus.ACTIVE;
    const data = seats.map((seat) => ({
      carriageId,
      seatTypeId: dto.seatTypeId,
      seatNumber: seat.seatNumber,
      rowNumber: seat.rowNumber,
      columnNumber: seat.columnNumber,
      floorNumber: seat.floorNumber,
      status
    }));

    if (dto.previewOnly) {
      return {
        data: {
          seats: data
        },
        message: 'Preview ghế thành công'
      };
    }

    await this.prisma.seat.createMany({
      data
    });

    return {
      data: {
        created: data.length,
        seats: data
      },
      message: 'Tạo ghế hàng loạt thành công'
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
        deletedAt: null,
        carriage: {
          deletedAt: null,
          train: {
            deletedAt: null
          }
        }
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

    if (dto.seatNumber) {
      await this.ensureSeatNumberIsUnique(
        currentSeat.carriageId,
        dto.seatNumber,
        id
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
        status: 'INACTIVE',
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
        deletedAt: null,
        train: {
          deletedAt: null
        }
      },
      select: {
        id: true
      }
    });

    if (!carriage) {
      throw new AppException(
        'CARRIAGE_NOT_FOUND',
        'Toa không tồn tại hoặc đã bị xóa mềm',
        undefined,
        ['Toa không tồn tại hoặc đã bị xóa mềm']
      );
    }
  }

  private async ensureSeatTypeMatchesCarriage(
    carriageId: string,
    seatTypeId: string
  ) {
    const carriage = await this.prisma.carriage.findFirst({
      where: {
        id: carriageId,
        deletedAt: null,
        train: {
          deletedAt: null
        }
      },
      select: {
        id: true,
        carriageType: true
      }
    });

    if (!carriage) {
      throw new AppException(
        'CARRIAGE_NOT_FOUND',
        'Toa không tồn tại hoặc đã bị xóa mềm',
        undefined,
        ['Toa không tồn tại hoặc đã bị xóa mềm']
      );
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
      const inactiveSeatType = await this.prisma.seatType.findUnique({
        where: {
          id: seatTypeId
        },
        select: {
          name: true,
          status: true
        }
      });

      throw new AppException(
        'SEAT_TYPE_INACTIVE',
        'Loại ghế không hoạt động',
        undefined,
        [
          inactiveSeatType
            ? `Loại ghế ${inactiveSeatType.name} không ACTIVE`
            : 'Loại ghế không tồn tại hoặc không ACTIVE'
        ]
      );
    }

    const allowedCarriageTypes = this.parseAllowedCarriageTypes(
      seatType.allowedCarriageTypes
    );

    if (!allowedCarriageTypes.includes(carriage.carriageType)) {
      throw new AppException(
        'SEAT_TYPE_NOT_ALLOWED_FOR_CARRIAGE',
        'Loại ghế không phù hợp với loại toa',
        undefined,
        [
          `Loại ghế ${seatType.name} không phù hợp với ${this.getCarriageTypeLabel(carriage.carriageType)}`
        ]
      );
    }

    return {
      carriage,
      seatType
    };
  }

  private async findExistingSeat(id: string) {
    const seat = await this.prisma.seat.findFirst({
      where: {
        id,
        deletedAt: null,
        carriage: {
          deletedAt: null,
          train: {
            deletedAt: null
          }
        }
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

  private async ensureSeatNumberIsUnique(
    carriageId: string,
    seatNumber: string,
    excludeId?: string
  ) {
    const existingSeat = await this.prisma.seat.findFirst({
      where: {
        carriageId,
        seatNumber,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      },
      include: {
        carriage: {
          select: {
            carriageNumber: true
          }
        }
      }
    });

    if (existingSeat) {
      throw new AppException(
        'SEAT_NUMBER_DUPLICATED',
        'Số ghế đã tồn tại',
        undefined,
        [
          `Số ghế ${seatNumber} đã tồn tại trong toa ${existingSeat.carriage.carriageNumber}`
        ]
      );
    }
  }

  private async ensureGeneratedSeatsAreUnique(
    carriageId: string,
    seats: Array<{ seatNumber: string }>
  ) {
    const generatedNumbers = new Set<string>();

    for (const seat of seats) {
      if (generatedNumbers.has(seat.seatNumber)) {
        throw new AppException(
          'SEAT_LAYOUT_INVALID',
          'Layout sinh số ghế bị trùng',
          undefined,
          [`Số ghế ${seat.seatNumber} bị trùng trong layout`]
        );
      }

      generatedNumbers.add(seat.seatNumber);
    }

    const existingSeats = await this.prisma.seat.findMany({
      where: {
        carriageId,
        deletedAt: null,
        seatNumber: {
          in: [...generatedNumbers]
        }
      },
      select: {
        seatNumber: true
      }
    });

    if (existingSeats.length > 0) {
      throw new AppException(
        'SEAT_NUMBER_DUPLICATED',
        'Số ghế đã tồn tại',
        undefined,
        existingSeats.map(
          (seat) => `Số ghế ${seat.seatNumber} đã tồn tại trong toa`
        )
      );
    }
  }

  private buildGeneratedSeats(dto: GenerateSeatsDto) {
    if (dto.layoutType === SeatLayoutType.SEAT_GRID) {
      return this.buildSeatGrid(dto);
    }

    if (dto.layoutType === SeatLayoutType.SLEEPER_ROOM) {
      return this.buildSleeperRoom(dto);
    }

    throw new AppException(
      'SEAT_LAYOUT_UNSUPPORTED',
      'Layout ghế không được hỗ trợ',
      undefined,
      ['Layout ghế không được hỗ trợ']
    );
  }

  private buildSeatGrid(dto: GenerateSeatsDto) {
    if (!dto.rows || !dto.columns) {
      throw new AppException(
        'SEAT_LAYOUT_INVALID',
        'Layout ghế không hợp lệ',
        undefined,
        ['rows và columns là bắt buộc với SEAT_GRID']
      );
    }

    const numbering = dto.numbering ?? SeatNumberingMode.ROW_COLUMN;

    if (
      ![SeatNumberingMode.ROW_COLUMN, SeatNumberingMode.NUMERIC].includes(
        numbering
      )
    ) {
      throw new AppException(
        'SEAT_LAYOUT_INVALID',
        'Kiểu đánh số không phù hợp với layout',
        undefined,
        ['SEAT_GRID chỉ hỗ trợ ROW_COLUMN hoặc NUMERIC']
      );
    }

    const seats: Array<{
      seatNumber: string;
      rowNumber: number;
      columnNumber: number;
      floorNumber: null;
    }> = [];
    let sequence = 1;

    for (let row = 1; row <= dto.rows; row += 1) {
      for (let column = 1; column <= dto.columns; column += 1) {
        seats.push({
          seatNumber:
            numbering === SeatNumberingMode.NUMERIC
              ? sequence.toString().padStart(2, '0')
              : `${this.toRowLabel(row)}${column}`,
          rowNumber: row,
          columnNumber: column,
          floorNumber: null
        });
        sequence += 1;
      }
    }

    return seats;
  }

  private buildSleeperRoom(dto: GenerateSeatsDto) {
    if (!dto.rooms || !dto.bedsPerRoom) {
      throw new AppException(
        'SEAT_LAYOUT_INVALID',
        'Layout ghế không hợp lệ',
        undefined,
        ['rooms và bedsPerRoom là bắt buộc với SLEEPER_ROOM']
      );
    }

    const numbering = dto.numbering ?? SeatNumberingMode.ROOM_BED;

    if (numbering !== SeatNumberingMode.ROOM_BED) {
      throw new AppException(
        'SEAT_LAYOUT_INVALID',
        'Kiểu đánh số không phù hợp với layout',
        undefined,
        ['SLEEPER_ROOM chỉ hỗ trợ ROOM_BED']
      );
    }

    const seats: Array<{
      seatNumber: string;
      rowNumber: number;
      columnNumber: number;
      floorNumber: number;
    }> = [];

    for (let room = 1; room <= dto.rooms; room += 1) {
      for (let bed = 1; bed <= dto.bedsPerRoom; bed += 1) {
        seats.push({
          seatNumber: `${room}${this.toRowLabel(bed)}`,
          rowNumber: room,
          columnNumber: bed,
          floorNumber: bed
        });
      }
    }

    return seats;
  }

  private toRowLabel(value: number) {
    let currentValue = value;
    let label = '';

    while (currentValue > 0) {
      currentValue -= 1;
      label = String.fromCharCode(65 + (currentValue % 26)) + label;
      currentValue = Math.floor(currentValue / 26);
    }

    return label;
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
