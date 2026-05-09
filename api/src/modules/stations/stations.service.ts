import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { getPaginationOffset } from '../../common/utils/pagination.util';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateStationDto } from './dto/create-station.dto';
import { StationQueryDto } from './dto/station-query.dto';
import { UpdateStationDto } from './dto/update-station.dto';

type StationRecord = Awaited<ReturnType<PrismaService['station']['findFirst']>>;

@Injectable()
export class StationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStationDto) {
    await this.prisma.station.create({
      data: dto
    });

    return {
      message: 'Tạo ga thành công'
    };
  }

  async findMany(query: StationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.StationWhereInput = {
      deletedAt: null,
      ...(query.city ? { city: { contains: query.city } } : {}),
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

    const [stations, total] = await this.prisma.$transaction([
      this.prisma.station.findMany({
        where,
        orderBy: [{ code: 'asc' }],
        skip: getPaginationOffset(page, limit),
        take: limit
      }),
      this.prisma.station.count({ where })
    ]);

    return {
      data: stations.map((station) => this.serializeStation(station)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      message: 'Lấy danh sách ga thành công'
    };
  }

  async findById(id: string) {
    const station = await this.prisma.station.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });

    if (!station) {
      throw new NotFoundException('Không tìm thấy ga');
    }

    return this.serializeStation(station);
  }

  async update(id: string, dto: UpdateStationDto) {
    await this.findById(id);

    // TODO: Khi có trips, không cho đổi code nếu ga đã phát sinh chuyến,
    // trừ khi admin cấp cao xác nhận.
    await this.prisma.station.update({
      where: { id },
      data: dto
    });

    return {
      message: 'Cập nhật ga thành công'
    };
  }

  async delete(id: string) {
    await this.findById(id);

    // TODO: Khi có routes, không cho xóa ga nếu đang được dùng trong route active.
    await this.prisma.station.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    return {
      message: 'Xóa ga thành công'
    };
  }

  private serializeStation(station: NonNullable<StationRecord>) {
    return {
      ...station,
      latitude: station.latitude?.toString() ?? null,
      longitude: station.longitude?.toString() ?? null
    };
  }
}
