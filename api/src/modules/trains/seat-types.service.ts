import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { getPaginationOffset } from '../../common/utils/pagination.util';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateSeatTypeDto } from './dto/create-seat-type.dto';
import { SeatTypeQueryDto } from './dto/seat-type-query.dto';
import { UpdateSeatTypeDto } from './dto/update-seat-type.dto';

type SeatTypeRecord = Awaited<
  ReturnType<PrismaService['seatType']['findFirst']>
>;

@Injectable()
export class SeatTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSeatTypeDto) {
    await this.prisma.seatType.create({
      data: dto
    });

    return {
      message: 'Tạo loại ghế thành công'
    };
  }

  async findMany(query: SeatTypeQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.SeatTypeWhereInput = {
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

    const [seatTypes, total] = await this.prisma.$transaction([
      this.prisma.seatType.findMany({
        where,
        orderBy: [{ code: 'asc' }],
        skip: getPaginationOffset(page, limit),
        take: limit
      }),
      this.prisma.seatType.count({ where })
    ]);

    return {
      data: seatTypes.map((seatType) => this.serializeSeatType(seatType)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      message: 'Lấy danh sách loại ghế thành công'
    };
  }

  async findById(id: string) {
    const seatType = await this.prisma.seatType.findUnique({
      where: { id }
    });

    if (!seatType) {
      throw new NotFoundException('Không tìm thấy loại ghế');
    }

    return this.serializeSeatType(seatType);
  }

  async update(id: string, dto: UpdateSeatTypeDto) {
    await this.findById(id);

    await this.prisma.seatType.update({
      where: { id },
      data: dto
    });

    return {
      message: 'Cập nhật loại ghế thành công'
    };
  }

  async delete(id: string) {
    await this.findById(id);

    await this.prisma.seatType.update({
      where: { id },
      data: {
        status: 'INACTIVE'
      }
    });

    return {
      message: 'Vô hiệu hóa loại ghế thành công'
    };
  }

  private serializeSeatType(seatType: NonNullable<SeatTypeRecord>) {
    return {
      ...seatType,
      baseMultiplier: seatType.baseMultiplier.toString()
    };
  }
}
