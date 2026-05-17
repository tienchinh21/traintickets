import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import {
  Prisma,
  RouteStatus,
  StationStatus,
  TrainStatus,
  TripStatus
} from '@prisma/client';
import { AppException } from '../../common/exceptions/app.exception';
import { getPaginationOffset } from '../../common/utils/pagination.util';
import { PrismaService } from '../../database/prisma/prisma.service';
import { ClientSearchTripsDto } from './dto/client-search-trips.dto';
import { CreateTripDto } from './dto/create-trip.dto';
import { GenerateTripCodeDto } from './dto/generate-trip-code.dto';
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
    const serviceDate = this.parseServiceDate(dto.serviceDate);
    const [route, train] = await Promise.all([
      this.ensureRouteIsUsable(dto.routeId),
      this.ensureTrainIsUsable(dto.trainId)
    ]);
    const code =
      dto.code ?? (await this.generateNextTripCode(train.code, serviceDate));

    this.ensureTripCodeMatchesTrainDate(code, train.code, serviceDate);
    await this.ensureCodeIsUnique(code);

    const tripStops = this.buildTripStops(route, serviceDate);

    await this.prisma.$transaction(async (tx) => {
      const trip = await tx.trip.create({
        data: {
          routeId: dto.routeId,
          trainId: dto.trainId,
          code,
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

  async generateCode(dto: GenerateTripCodeDto) {
    const train = await this.ensureTrainIsUsable(dto.trainId);
    const serviceDate = this.parseServiceDate(dto.serviceDate);

    return {
      data: {
        code: await this.generateNextTripCode(train.code, serviceDate)
      },
      message: 'Tạo mã chuyến thành công'
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

    const routeId = dto.routeId ?? currentTrip.routeId;
    const trainId = dto.trainId ?? currentTrip.trainId;
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
    const shouldResolveTrain = Boolean(
      dto.trainId || dto.code || dto.serviceDate
    );
    const train = shouldResolveTrain
      ? await this.ensureTrainIsUsable(trainId)
      : null;
    const code =
      dto.code ??
      (dto.trainId || dto.serviceDate
        ? await this.generateNextTripCode(
            train?.code ?? currentTrip.code.split('-')[0],
            serviceDate,
            currentTrip.id
          )
        : undefined);

    if (code && train) {
      this.ensureTripCodeMatchesTrainDate(code, train.code, serviceDate);
      await this.ensureCodeIsUnique(code, id);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.trip.update({
        where: { id },
        data: {
          routeId: dto.routeId,
          trainId: dto.trainId,
          code,
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
        status: 'CANCELLED',
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

    // Find trips that contain BOTH stations and fromStation comes before toStation
    const where: Prisma.TripWhereInput = {
      deletedAt: null,
      status: dto.status ?? TripStatus.OPEN,
      serviceDate: this.parseServiceDate(dto.serviceDate),
      AND: [
        {
          stops: {
            some: {
              stationId: dto.fromStationId
            }
          }
        },
        {
          stops: {
            some: {
              stationId: dto.toStationId
            }
          }
        }
      ]
    };

    // Count total matching trips (with direction check in app layer)
    const allTrips = await this.prisma.trip.findMany({
      where,
      include: tripInclude,
      orderBy: [{ serviceDate: 'asc' }, { code: 'asc' }]
    });

    // Filter by direction: fromStation.stopOrder < toStation.stopOrder
    const matchedTrips = allTrips.filter((trip) => {
      const fromStop = trip.stops.find(
        (stop) => stop.stationId === dto.fromStationId
      );
      const toStop = trip.stops.find(
        (stop) => stop.stationId === dto.toStationId
      );

      return fromStop && toStop && fromStop.stopOrder < toStop.stopOrder;
    });

    const total = matchedTrips.length;
    const offset = getPaginationOffset(page, limit);
    const pagedTrips = matchedTrips
      .slice(offset, offset + limit)
      .map((trip) => this.serializeTrip(trip));

    return {
      data: pagedTrips,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      message: 'Tìm chuyến thành công'
    };
  }

  async searchForClient(dto: ClientSearchTripsDto) {
    if (dto.fromStationId === dto.toStationId) {
      throw new BadRequestException('Ga đi và ga đến phải khác nhau');
    }

    await this.ensureClientStationsAreUsable([
      dto.fromStationId,
      dto.toStationId
    ]);

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const serviceDate = this.parseServiceDate(dto.serviceDate);
    const departureAfter = this.resolveDepartureAfter(
      dto.serviceDate,
      dto.departureTime
    );
    const where: Prisma.TripWhereInput = {
      deletedAt: null,
      status: TripStatus.OPEN,
      serviceDate,
      route: {
        deletedAt: null,
        status: RouteStatus.ACTIVE
      },
      train: {
        deletedAt: null,
        status: TrainStatus.ACTIVE
      },
      AND: [
        {
          stops: {
            some: {
              stationId: dto.fromStationId
            }
          }
        },
        {
          stops: {
            some: {
              stationId: dto.toStationId
            }
          }
        }
      ]
    };

    const allTrips = await this.prisma.trip.findMany({
      where,
      include: tripInclude
    });

    const matchedTrips = allTrips
      .map((trip) => {
        const fromStop = trip.stops.find(
          (stop) => stop.stationId === dto.fromStationId
        );
        const toStop = trip.stops.find(
          (stop) => stop.stationId === dto.toStationId
        );

        return { trip, fromStop, toStop };
      })
      .filter(({ fromStop, toStop }) => {
        if (!fromStop || !toStop) {
          return false;
        }

        return (
          fromStop.stopOrder < toStop.stopOrder &&
          fromStop.scheduledDepartureAt !== null &&
          fromStop.scheduledDepartureAt >= departureAfter
        );
      })
      .sort((left, right) => {
        const leftTime = left.fromStop?.scheduledDepartureAt?.getTime() ?? 0;
        const rightTime = right.fromStop?.scheduledDepartureAt?.getTime() ?? 0;

        return (
          leftTime - rightTime || left.trip.code.localeCompare(right.trip.code)
        );
      });

    const total = matchedTrips.length;
    const offset = getPaginationOffset(page, limit);
    const pagedTrips = matchedTrips
      .slice(offset, offset + limit)
      .map(({ trip, fromStop, toStop }) =>
        this.serializeClientTrip(
          trip,
          fromStop as NonNullable<typeof fromStop>,
          toStop as NonNullable<typeof toStop>
        )
      );

    return {
      data: pagedTrips,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
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
        id: true,
        code: true
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

    return train;
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

  private async generateNextTripCode(
    trainCode: string,
    serviceDate: Date,
    excludeId?: string
  ) {
    const baseCode = `${trainCode}-${this.formatServiceDateCode(serviceDate)}`;
    const existingTrips = await this.prisma.trip.findMany({
      where: {
        code: {
          startsWith: baseCode
        },
        ...(excludeId ? { id: { not: excludeId } } : {})
      },
      select: {
        code: true
      }
    });

    const usedSuffixes = new Set<number>();
    for (const trip of existingTrips) {
      if (trip.code === baseCode) {
        usedSuffixes.add(1);
        continue;
      }

      const suffix = trip.code.match(new RegExp(`^${baseCode}-(\\d{2})$`));
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

  private ensureTripCodeMatchesTrainDate(
    code: string,
    trainCode: string,
    serviceDate: Date
  ) {
    const expectedPrefix = `${trainCode}-${this.formatServiceDateCode(serviceDate)}`;
    if (code === expectedPrefix || code.startsWith(`${expectedPrefix}-`)) {
      return;
    }

    throw new AppException(
      'TRIP_CODE_INVALID_FORMAT',
      'Mã chuyến không đúng định dạng',
      undefined,
      [`Mã chuyến phải bắt đầu bằng ${expectedPrefix}`]
    );
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

  private resolveDepartureAfter(serviceDate: string, departureTime: string) {
    return new Date(`${serviceDate}T${departureTime}:00.000Z`);
  }

  private formatServiceDateCode(serviceDate: Date) {
    return serviceDate.toISOString().slice(0, 10).replace(/-/g, '');
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

  private async ensureClientStationsAreUsable(stationIds: string[]) {
    const stations = await this.prisma.station.findMany({
      where: {
        id: { in: stationIds },
        deletedAt: null,
        status: StationStatus.ACTIVE
      },
      select: { id: true }
    });
    const foundStationIds = new Set(stations.map((station) => station.id));
    const missingStationIds = stationIds.filter(
      (stationId) => !foundStationIds.has(stationId)
    );

    if (missingStationIds.length > 0) {
      throw new AppException(
        'STATION_NOT_USABLE',
        'Ga đi hoặc ga đến không tồn tại hoặc không hoạt động',
        400,
        ['Ga phải tồn tại, chưa bị xóa và đang ACTIVE']
      );
    }
  }

  private serializeClientTrip(
    trip: TripWithDetail,
    fromStop: TripWithDetail['stops'][number],
    toStop: TripWithDetail['stops'][number]
  ) {
    return {
      id: trip.id,
      code: trip.code,
      status: trip.status,
      train: {
        id: trip.train.id,
        code: trip.train.code,
        name: trip.train.name
      },
      route: {
        id: trip.route.id,
        code: trip.route.code,
        name: trip.route.name
      },
      from: {
        stationId: fromStop.stationId,
        code: fromStop.station.code,
        name: fromStop.station.name,
        city: fromStop.station.city,
        scheduledDepartureAt:
          fromStop.scheduledDepartureAt?.toISOString() ?? null
      },
      to: {
        stationId: toStop.stationId,
        code: toStop.station.code,
        name: toStop.station.name,
        city: toStop.station.city,
        scheduledArrivalAt: toStop.scheduledArrivalAt?.toISOString() ?? null
      },
      durationMinutes: this.resolveDurationMinutes(
        fromStop.scheduledDepartureAt,
        toStop.scheduledArrivalAt
      ),
      distanceKm: toStop.distanceFromStartKm
        .minus(fromStop.distanceFromStartKm)
        .toString(),
      stops: trip.stops.map((stop) => ({
        stationId: stop.stationId,
        code: stop.station.code,
        name: stop.station.name,
        scheduledArrivalAt: stop.scheduledArrivalAt?.toISOString() ?? null,
        scheduledDepartureAt: stop.scheduledDepartureAt?.toISOString() ?? null,
        stopOrder: stop.stopOrder
      }))
    };
  }

  private resolveDurationMinutes(
    departureAt: Date | null,
    arrivalAt: Date | null
  ) {
    if (!departureAt || !arrivalAt) {
      return null;
    }

    return Math.max(
      0,
      Math.round((arrivalAt.getTime() - departureAt.getTime()) / 60_000)
    );
  }
}
