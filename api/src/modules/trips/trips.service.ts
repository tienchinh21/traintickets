import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { Prisma, RouteStatus, TrainStatus, TripStatus } from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { getPaginationOffset } from '../../common/utils/pagination.util';
import { PrismaService } from '../../database/prisma/prisma.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { SearchTripsDto } from './dto/search-trips.dto';
import { TripQueryDto } from './dto/trip-query.dto';
import { UpdateTripDto } from './dto/update-trip.dto';

const tripInclude = {
  route: {
    select: {
      id: true,
      code: true,
      name: true,
      status: true
    }
  },
  train: {
    select: {
      id: true,
      code: true,
      name: true,
      status: true
    }
  },
  stops: {
    include: {
      station: true
    },
    orderBy: {
      stopOrder: 'asc'
    }
  }
} satisfies Prisma.TripInclude;

const routeWithStopsInclude = {
  stops: {
    orderBy: {
      stopOrder: 'asc'
    }
  }
} satisfies Prisma.RouteInclude;

type RouteWithStops = Prisma.RouteGetPayload<{
  include: typeof routeWithStopsInclude;
}>;

type TripWithDetail = Prisma.TripGetPayload<{
  include: typeof tripInclude;
}>;

@Injectable()
export class TripsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTripDto) {
    const [route] = await Promise.all([
      this.ensureRouteIsUsable(dto.routeId),
      this.ensureTrainIsUsable(dto.trainId),
      this.ensureCodeIsUnique(dto.code)
    ]);
    const serviceDate = this.parseServiceDate(dto.serviceDate);
    const tripStops = this.buildTripStops(route, serviceDate);

    await this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          routeId: dto.routeId,
          trainId: dto.trainId,
          code: dto.code,
          serviceDate,
          status: dto.status
        }
      });

      await tx.tripStop.createMany({
        data: tripStops.map((stop) => ({
          ...stop,
          tripId: trip.id
        }))
      });
    });

    return {
      message: 'Tạo chuyến thành công'
    };
  }

  async findMany(query: TripQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const where: Prisma.TripWhereInput = {
      deletedAt: null,
      ...(query.status ? { status: query.status } : {}),
      ...(query.routeId ? { routeId: query.routeId } : {}),
      ...(query.trainId ? { trainId: query.trainId } : {}),
      ...(query.serviceDate
        ? { serviceDate: this.parseServiceDate(query.serviceDate) }
        : {}),
      ...(query.search
        ? {
            OR: [
              { code: { contains: query.search } },
              { route: { code: { contains: query.search } } },
              { route: { name: { contains: query.search } } },
              { train: { code: { contains: query.search } } },
              { train: { name: { contains: query.search } } }
            ]
          }
        : {})
    };

    const [trips, total] = await this.prisma.$transaction([
      this.prisma.trip.findMany({
        where,
        include: {
          route: {
            select: {
              id: true,
              code: true,
              name: true,
              status: true
            }
          },
          train: {
            select: {
              id: true,
              code: true,
              name: true,
              status: true
            }
          }
        },
        orderBy: [{ serviceDate: 'desc' }, { code: 'asc' }],
        skip: getPaginationOffset(page, limit),
        take: limit
      }),
      this.prisma.trip.count({ where })
    ]);

    return {
      data: trips,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      message: 'Lấy danh sách chuyến thành công'
    };
  }

  async findById(id: string) {
    const trip = await this.prisma.trip.findFirst({
      where: {
        id,
        deletedAt: null
      },
      include: tripInclude
    });

    if (!trip) {
      throw new NotFoundException('Không tìm thấy chuyến');
    }

    return this.serializeTrip(trip);
  }

  async update(id: string, dto: UpdateTripDto) {
    const currentTrip = await this.findExistingTrip(id);

    if (dto.code) {
      await this.ensureCodeIsUnique(dto.code, id);
    }

    const routeId = dto.routeId ?? currentTrip.routeId;
    const serviceDate = dto.serviceDate
      ? this.parseServiceDate(dto.serviceDate)
      : currentTrip.serviceDate;
    const routeChanged = Boolean(
      dto.routeId && dto.routeId !== currentTrip.routeId
    );
    const serviceDateChanged = Boolean(dto.serviceDate);
    const route = routeChanged
      ? await this.ensureRouteIsUsable(routeId)
      : await this.getRouteWithStops(routeId);

    if (dto.trainId) {
      await this.ensureTrainIsUsable(dto.trainId);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.trip.update({
        where: { id },
        data: {
          routeId: dto.routeId,
          trainId: dto.trainId,
          code: dto.code,
          serviceDate,
          status: dto.status
        }
      });

      if (routeChanged || serviceDateChanged) {
        await tx.tripStop.deleteMany({
          where: { tripId: id }
        });
        await tx.tripStop.createMany({
          data: this.buildTripStops(route, serviceDate).map((stop) => ({
            ...stop,
            tripId: id
          }))
        });
      }
    });

    return {
      message: 'Cập nhật chuyến thành công'
    };
  }

  async delete(id: string) {
    await this.findExistingTrip(id);

    await this.prisma.trip.update({
      where: { id },
      data: {
        deletedAt: new Date()
      }
    });

    return {
      message: 'Xóa chuyến thành công'
    };
  }

  async search(dto: SearchTripsDto) {
    if (dto.fromStationId === dto.toStationId) {
      throw new BadRequestException('Ga đi và ga đến phải khác nhau');
    }

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const where: Prisma.TripWhereInput = {
      deletedAt: null,
      status: dto.status ?? TripStatus.OPEN,
      serviceDate: this.parseServiceDate(dto.serviceDate),
      stops: {
        some: {
          stationId: dto.fromStationId
        }
      },
      AND: [
        {
          stops: {
            some: {
              stationId: dto.toStationId
            }
          }
        }
      ]
    };

    const trips = await this.prisma.trip.findMany({
      where,
      include: tripInclude,
      orderBy: [{ serviceDate: 'asc' }, { code: 'asc' }]
    });

    const matchedTrips = trips
      .map((trip) => this.serializeTrip(trip))
      .filter((trip) => {
        const fromStop = trip.stops.find(
          (stop) => stop.stationId === dto.fromStationId
        );
        const toStop = trip.stops.find(
          (stop) => stop.stationId === dto.toStationId
        );

        return fromStop && toStop && fromStop.stopOrder < toStop.stopOrder;
      });
    const pagedTrips = matchedTrips.slice(
      getPaginationOffset(page, limit),
      getPaginationOffset(page, limit) + limit
    );

    return {
      data: pagedTrips,
      meta: {
        page,
        limit,
        total: matchedTrips.length,
        totalPages: Math.ceil(matchedTrips.length / limit)
      },
      message: 'Tìm chuyến thành công'
    };
  }

  private async ensureRouteIsUsable(routeId: string) {
    const route = await this.prisma.route.findFirst({
      where: {
        id: routeId,
        deletedAt: null,
        status: RouteStatus.ACTIVE
      },
      include: routeWithStopsInclude
    });

    if (!route) {
      throw new AppException(
        'ROUTE_NOT_USABLE',
        'Tuyến không tồn tại hoặc không ACTIVE',
        undefined,
        ['Tuyến phải tồn tại, chưa bị xóa mềm và đang ACTIVE']
      );
    }

    if (route.stops.length < 2) {
      throw new AppException(
        'ROUTE_MUST_HAVE_AT_LEAST_TWO_STOPS',
        'Tuyến phải có ít nhất 2 ga dừng',
        undefined,
        ['Không thể tạo chuyến từ tuyến có ít hơn 2 ga dừng']
      );
    }

    return route;
  }

  private async getRouteWithStops(routeId: string) {
    const route = await this.prisma.route.findFirst({
      where: {
        id: routeId,
        deletedAt: null
      },
      include: routeWithStopsInclude
    });

    if (!route) {
      throw new NotFoundException('Không tìm thấy tuyến của chuyến');
    }

    return route;
  }

  private async ensureTrainIsUsable(trainId: string) {
    const train = await this.prisma.train.findFirst({
      where: {
        id: trainId,
        deletedAt: null,
        status: TrainStatus.ACTIVE
      },
      select: {
        id: true
      }
    });

    if (!train) {
      throw new AppException(
        'TRAIN_NOT_USABLE',
        'Tàu không tồn tại hoặc không ACTIVE',
        undefined,
        ['Tàu phải tồn tại, chưa bị xóa mềm và đang ACTIVE']
      );
    }
  }

  private async ensureCodeIsUnique(code: string, excludeId?: string) {
    const existingTrip = await this.prisma.trip.findFirst({
      where: {
        code,
        ...(excludeId ? { id: { not: excludeId } } : {})
      },
      select: {
        id: true
      }
    });

    if (existingTrip) {
      throw new AppException(
        'TRIP_CODE_DUPLICATED',
        'Mã chuyến đã tồn tại',
        undefined,
        [`Mã chuyến ${code} đã tồn tại`]
      );
    }
  }

  private async findExistingTrip(id: string) {
    const trip = await this.prisma.trip.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });

    if (!trip) {
      throw new NotFoundException('Không tìm thấy chuyến');
    }

    return trip;
  }

  private buildTripStops(route: RouteWithStops, serviceDate: Date) {
    const tripStops = route.stops.map((stop) => ({
      stationId: stop.stationId,
      stopOrder: stop.stopOrder,
      scheduledArrivalAt: this.addOffsetMinutes(
        serviceDate,
        stop.defaultArrivalOffsetMinutes
      ),
      scheduledDepartureAt: this.addOffsetMinutes(
        serviceDate,
        stop.defaultDepartureOffsetMinutes
      ),
      distanceFromStartKm: stop.distanceFromStartKm
    }));

    this.validateTripStopSchedule(tripStops);
    return tripStops;
  }

  private validateTripStopSchedule(
    stops: Array<{
      stopOrder: number;
      scheduledArrivalAt: Date | null;
      scheduledDepartureAt: Date | null;
    }>
  ) {
    let previousTime: Date | null = null;

    for (const stop of [...stops].sort((a, b) => a.stopOrder - b.stopOrder)) {
      if (
        stop.scheduledArrivalAt &&
        stop.scheduledDepartureAt &&
        stop.scheduledDepartureAt < stop.scheduledArrivalAt
      ) {
        throw new BadRequestException(
          'scheduled_departure_at phải lớn hơn hoặc bằng scheduled_arrival_at'
        );
      }

      for (const currentTime of [
        stop.scheduledArrivalAt,
        stop.scheduledDepartureAt
      ]) {
        if (!currentTime) {
          continue;
        }

        if (previousTime && currentTime < previousTime) {
          throw new BadRequestException(
            'Lịch trình chuyến phải tăng dần theo thứ tự ga'
          );
        }

        previousTime = currentTime;
      }
    }
  }

  private parseServiceDate(value: string) {
    return new Date(`${value}T00:00:00.000Z`);
  }

  private addOffsetMinutes(serviceDate: Date, offsetMinutes?: number | null) {
    if (offsetMinutes === undefined || offsetMinutes === null) {
      return null;
    }

    return new Date(serviceDate.getTime() + offsetMinutes * 60_000);
  }

  private serializeTrip(trip: TripWithDetail) {
    return {
      ...trip,
      stops: trip.stops.map((stop) => ({
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
}
