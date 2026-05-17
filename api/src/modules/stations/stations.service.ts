import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, RouteStatus, StationStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { getPaginationOffset } from '../../common/utils/pagination.util';
import { PrismaService } from '../../database/prisma/prisma.service';
import { ClientStationQueryDto } from './dto/client-station-query.dto';
import { CreateStationDto } from './dto/create-station.dto';
import { StationQueryDto } from './dto/station-query.dto';
import { UpdateStationDto } from './dto/update-station.dto';

type StationRecord = Awaited<ReturnType<PrismaService['station']['findFirst']>>;

@Injectable()
export class StationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStationDto) {
    await this.ensureCodeIsUnique(dto.code);

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

  async findManyForClient(query: ClientStationQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const city = query.province ?? query.city;
    const where: Prisma.StationWhereInput = {
      deletedAt: null,
      status: StationStatus.ACTIVE,
      ...(city ? { city: { contains: city } } : {}),
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
      data: stations.map((station) => this.serializeClientStation(station)),
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

    if (dto.code) {
      await this.ensureCodeIsUnique(dto.code, id);
    }

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
    await this.ensureStationIsNotUsedByActiveRoute(id);

    await this.prisma.station.update({
      where: { id },
      data: {
        status: 'INACTIVE',
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

  private serializeClientStation(station: NonNullable<StationRecord>) {
    return {
      id: station.id,
      code: station.code,
      name: station.name,
      city: station.city,
      address: station.address
    };
  }

  private async ensureCodeIsUnique(code: string, excludeId?: string) {
    const existingStation = await this.prisma.station.findFirst({
      where: {
        code,
        deletedAt: null,
        ...(excludeId ? { id: { not: excludeId } } : {})
      },
      select: {
        id: true
      }
    });

    if (existingStation) {
      throw new AppException(
        'STATION_CODE_DUPLICATED',
        'Mã ga đã tồn tại',
        undefined,
        [`Mã ga ${code} đã tồn tại`]
      );
    }
  }

  private async ensureStationIsNotUsedByActiveRoute(id: string) {
    const routeStop = await this.prisma.routeStop.findFirst({
      where: {
        stationId: id,
        route: {
          deletedAt: null,
          status: RouteStatus.ACTIVE
        }
      },
      include: {
        route: {
          select: {
            code: true,
            name: true
          }
        }
      }
    });

    if (routeStop) {
      throw new AppException(
        'STATION_IN_ACTIVE_ROUTE',
        'Không thể xóa ga đang thuộc tuyến hoạt động',
        400,
        [
          `Ga đang được dùng trong tuyến ${routeStop.route.code} - ${routeStop.route.name}`
        ]
      );
    }
  }
}
