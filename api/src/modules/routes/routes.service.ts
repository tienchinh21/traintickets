import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Prisma, StationStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { getPaginationOffset } from '../../common/utils/pagination.util';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { GenerateRouteCodeDto } from './dto/generate-route-code.dto';
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
    const code = dto.code ?? (await this.generateCodeFromStops(dto.stops));
    await this.ensureCodeIsUnique(code);

    await this.prisma.$transaction(async (tx) => {
      const createdRoute = await tx.route.create({
        data: {
          code,
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

  async generateCode(dto: GenerateRouteCodeDto) {
    return {
      data: {
        code: await this.generateRouteCode(dto.fromStationId, dto.toStationId)
      },
      message: 'Tạo mã tuyến thành công'
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

    if (dto.code) {
      await this.ensureCodeIsUnique(dto.code, id);
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
      throw new AppException(
        'ROUTE_MUST_HAVE_AT_LEAST_TWO_STOPS',
        'Tuyến phải có ít nhất 2 ga dừng',
        undefined,
        ['Tuyến phải có ít nhất 2 ga dừng']
      );
    }

    const stopOrders = new Set<number>();
    const stationIds = new Set<string>();

    for (const stop of stops) {
      if (stopOrders.has(stop.stopOrder)) {
        throw new AppException(
          'ROUTE_STOP_DUPLICATED',
          'Ga dừng trong tuyến bị trùng',
          undefined,
          [`Thứ tự ga dừng ${stop.stopOrder} bị trùng trong cùng tuyến`]
        );
      }

      if (stationIds.has(stop.stationId)) {
        throw new AppException(
          'ROUTE_STOP_DUPLICATED',
          'Ga dừng trong tuyến bị trùng',
          undefined,
          [`Ga ${stop.stationId} bị trùng trong cùng tuyến`]
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

  private async generateCodeFromStops(stops: RouteStopDto[]) {
    const orderedStops = [...stops].sort((a, b) => a.stopOrder - b.stopOrder);
    return this.generateRouteCode(
      orderedStops[0].stationId,
      orderedStops[orderedStops.length - 1].stationId
    );
  }

  private async generateRouteCode(fromStationId: string, toStationId: string) {
    if (fromStationId === toStationId) {
      throw new AppException(
        'ROUTE_CODE_INVALID_STATIONS',
        'Ga đầu và ga cuối phải khác nhau',
        undefined,
        ['Không thể sinh mã tuyến từ cùng một ga']
      );
    }

    const stations = await this.prisma.station.findMany({
      where: {
        id: {
          in: [fromStationId, toStationId]
        },
        deletedAt: null,
        status: StationStatus.ACTIVE
      },
      select: {
        id: true,
        code: true
      }
    });
    const fromStation = stations.find(
      (station) => station.id === fromStationId
    );
    const toStation = stations.find((station) => station.id === toStationId);

    if (!fromStation || !toStation) {
      throw new AppException(
        'ROUTE_CODE_STATION_NOT_FOUND',
        'Ga sinh mã tuyến không hợp lệ',
        undefined,
        ['Ga đầu và ga cuối phải tồn tại, chưa bị xóa mềm và đang ACTIVE']
      );
    }

    const baseCode = `${this.getStationRouteCode(fromStation.code)}-${this.getStationRouteCode(toStation.code)}`;
    const existingRoutes = await this.prisma.route.findMany({
      where: {
        code: {
          startsWith: baseCode
        }
      },
      select: {
        code: true
      }
    });
    const usedSuffixes = new Set<number>();

    for (const route of existingRoutes) {
      if (route.code === baseCode) {
        usedSuffixes.add(1);
        continue;
      }

      const suffix = route.code.match(new RegExp(`^${baseCode}-(\\d{2})$`));
      if (suffix) {
        usedSuffixes.add(Number(suffix[1]));
      }
    }

    if (!usedSuffixes.has(1)) {
      return baseCode;
    }

    let nextSuffix = 2;
    while (usedSuffixes.has(nextSuffix)) {
      nextSuffix += 1;
    }

    return `${baseCode}-${nextSuffix.toString().padStart(2, '0')}`;
  }

  private async ensureCodeIsUnique(code: string, excludeId?: string) {
    const existingRoute = await this.prisma.route.findFirst({
      where: {
        code,
        ...(excludeId ? { id: { not: excludeId } } : {})
      },
      select: {
        id: true
      }
    });

    if (existingRoute) {
      throw new AppException(
        'ROUTE_CODE_DUPLICATED',
        'Mã tuyến đã tồn tại',
        undefined,
        [`Mã tuyến ${code} đã tồn tại`]
      );
    }
  }

  private getStationRouteCode(stationCode: string) {
    const aliases: Record<string, string> = {
      HAN: 'HN',
      DAD: 'DN',
      SGN: 'SG',
      SAI: 'SG'
    };

    return aliases[stationCode] ?? stationCode;
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
