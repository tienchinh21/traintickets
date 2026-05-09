import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Prisma, StationStatus } from '@prisma/client';
import { getPaginationOffset } from '../../common/utils/pagination.util';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { RouteQueryDto } from './dto/route-query.dto';
import { RouteStopDto } from './dto/route-stop.dto';
import { UpdateRouteDto } from './dto/update-route.dto';

const routeInclude = {
  stops: {
    include: {
      station: true
    },
    orderBy: {
      stopOrder: 'asc'
    }
  }
} satisfies Prisma.RouteInclude;

type RouteWithStops = Prisma.RouteGetPayload<{
  include: typeof routeInclude;
}>;
type RouteRecord = Awaited<ReturnType<PrismaService['route']['findFirst']>>;

@Injectable()
export class RoutesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRouteDto) {
    await this.validateStops(dto.stops);

    await this.prisma.$transaction(async (tx) => {
      const createdRoute = await tx.route.create({
        data: {
          code: dto.code,
          name: dto.name,
          description: dto.description,
          status: dto.status
        }
      });

      await tx.routeStop.createMany({
        data: this.buildRouteStopCreateManyData(createdRoute.id, dto.stops)
      });
    });

    return {
      message: 'Tạo tuyến thành công'
    };
  }

  async findMany(query: RouteQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.RouteWhereInput = {
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

    const [routes, total] = await this.prisma.$transaction([
      this.prisma.route.findMany({
        where,
        orderBy: [{ code: 'asc' }],
        skip: getPaginationOffset(page, limit),
        take: limit
      }),
      this.prisma.route.count({ where })
    ]);

    return {
      data: routes.map((route) => this.serializeRouteSummary(route)),
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      message: 'Lấy danh sách tuyến thành công'
    };
  }

  async findById(id: string) {
    const route = await this.prisma.route.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: routeInclude
    });

    if (!route) {
      throw new NotFoundException('Không tìm thấy tuyến');
    }

    return this.serializeRoute(route);
  }

  async update(id: string, dto: UpdateRouteDto) {
    await this.findById(id);

    if (dto.stops) {
      await this.validateStops(dto.stops);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.route.update({
        where: { id },
        data: {
          code: dto.code,
          name: dto.name,
          description: dto.description,
          status: dto.status
        }
      });

      if (dto.stops) {
        await tx.routeStop.deleteMany({
          where: { routeId: id }
        });

        await tx.routeStop.createMany({
          data: this.buildRouteStopCreateManyData(id, dto.stops)
        });
      }
    });

    return {
      message: 'Cập nhật tuyến thành công'
    };
  }

  async delete(id: string) {
    await this.findById(id);

    // TODO: Khi có trips, không cho xóa route active nếu đã có trip đang mở bán.
    await this.prisma.route.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    return {
      message: 'Xóa tuyến thành công'
    };
  }

  private async validateStops(stops: RouteStopDto[]) {
    if (stops.length < 2) {
      throw new BadRequestException('Tuyến phải có ít nhất 2 ga');
    }

    const stopOrders = new Set<number>();
    const stationIds = new Set<string>();

    for (const stop of stops) {
      if (stopOrders.has(stop.stopOrder)) {
        throw new BadRequestException(
          'stop_order không được trùng trong cùng tuyến'
        );
      }

      if (stationIds.has(stop.stationId)) {
        throw new BadRequestException(
          'station_id không được trùng trong cùng tuyến'
        );
      }

      stopOrders.add(stop.stopOrder);
      stationIds.add(stop.stationId);
    }

    const orderedStops = [...stops].sort((a, b) => a.stopOrder - b.stopOrder);
    for (let index = 1; index < orderedStops.length; index += 1) {
      if (
        orderedStops[index].distanceFromStartKm <=
        orderedStops[index - 1].distanceFromStartKm
      ) {
        throw new BadRequestException(
          'distance_from_start_km phải tăng dần theo stop_order'
        );
      }
    }

    const stations = await this.prisma.station.findMany({
      where: {
        id: {
          in: [...stationIds]
        },
        deletedAt: null,
        status: StationStatus.ACTIVE
      },
      select: {
        id: true
      }
    });

    if (stations.length !== stationIds.size) {
      throw new BadRequestException(
        'Tất cả ga trong tuyến phải tồn tại, chưa bị xóa mềm và đang ACTIVE'
      );
    }
  }

  private buildRouteStopCreateManyData(routeId: string, stops: RouteStopDto[]) {
    return stops.map((stop) => ({
      routeId,
      stationId: stop.stationId,
      stopOrder: stop.stopOrder,
      distanceFromStartKm: stop.distanceFromStartKm,
      defaultArrivalOffsetMinutes: stop.defaultArrivalOffsetMinutes,
      defaultDepartureOffsetMinutes: stop.defaultDepartureOffsetMinutes
    }));
  }

  private serializeRoute(route: RouteWithStops) {
    return {
      ...route,
      stops: route.stops.map((stop) => ({
        ...stop,
        distanceFromStartKm: stop.distanceFromStartKm.toString(),
        station: {
          ...stop.station,
          latitude: stop.station.latitude?.toString() ?? null,
          longitude: stop.station.longitude?.toString() ?? null
        }
      }))
    };
  }

  private serializeRouteSummary(route: NonNullable<RouteRecord>) {
    return route;
  }
}
