import {
  CarriageStatus,
  PermissionStatus,
  PrismaClient,
  RouteStatus,
  RoleStatus,
  SeatStatus,
  SeatTypeStatus,
  StationStatus,
  TrainStatus,
  UserStatus,
  UserType
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    {
      code: 'SUPER_ADMIN',
      name: 'Super Admin',
      description: 'Toàn quyền quản trị CMS'
    },
    {
      code: 'OPERATOR',
      name: 'Operator',
      description: 'Quyền vận hành CMS'
    },
    {
      code: 'CUSTOMER',
      name: 'Customer',
      description: 'Quyền mặc định của khách hàng'
    }
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {
        name: role.name,
        description: role.description,
        status: RoleStatus.ACTIVE
      },
      create: {
        ...role,
        status: RoleStatus.ACTIVE
      }
    });
  }

  const permissions = [
    ['ROLES_CREATE', 'Tạo vai trò', 'roles', 'create', 'POST', '/roles'],
    ['ROLES_READ', 'Xem vai trò', 'roles', 'read', 'GET', '/roles'],
    [
      'ROLES_UPDATE',
      'Cập nhật vai trò',
      'roles',
      'update',
      'PATCH',
      '/roles/:id'
    ],
    [
      'ROLES_DELETE',
      'Vô hiệu hóa vai trò',
      'roles',
      'delete',
      'DELETE',
      '/roles/:id'
    ],
    [
      'ROLES_SYNC_PERMISSIONS',
      'Gán quyền cho vai trò',
      'roles',
      'update',
      'PATCH',
      '/roles/:id/permissions'
    ],
    [
      'PERMISSIONS_CREATE',
      'Tạo quyền',
      'permissions',
      'create',
      'POST',
      '/permissions'
    ],
    [
      'PERMISSIONS_READ',
      'Xem quyền',
      'permissions',
      'read',
      'GET',
      '/permissions'
    ],
    [
      'PERMISSIONS_UPDATE',
      'Cập nhật quyền',
      'permissions',
      'update',
      'PATCH',
      '/permissions/:id'
    ],
    [
      'PERMISSIONS_DELETE',
      'Vô hiệu hóa quyền',
      'permissions',
      'delete',
      'DELETE',
      '/permissions/:id'
    ],
    ['STATIONS_CREATE', 'Tạo ga', 'stations', 'create', 'POST', '/stations'],
    ['STATIONS_READ', 'Xem ga', 'stations', 'read', 'GET', '/stations'],
    [
      'STATIONS_UPDATE',
      'Cập nhật ga',
      'stations',
      'update',
      'PATCH',
      '/stations/:id'
    ],
    [
      'STATIONS_DELETE',
      'Xóa ga',
      'stations',
      'delete',
      'DELETE',
      '/stations/:id'
    ],
    ['ROUTES_CREATE', 'Tạo tuyến', 'routes', 'create', 'POST', '/routes'],
    ['ROUTES_READ', 'Xem tuyến', 'routes', 'read', 'GET', '/routes'],
    [
      'ROUTES_UPDATE',
      'Cập nhật tuyến',
      'routes',
      'update',
      'PATCH',
      '/routes/:id'
    ],
    ['ROUTES_DELETE', 'Xóa tuyến', 'routes', 'delete', 'DELETE', '/routes/:id'],
    ['TRAINS_CREATE', 'Tạo tàu', 'trains', 'create', 'POST', '/trains'],
    ['TRAINS_READ', 'Xem tàu', 'trains', 'read', 'GET', '/trains'],
    [
      'TRAINS_UPDATE',
      'Cập nhật tàu',
      'trains',
      'update',
      'PATCH',
      '/trains/:id'
    ],
    ['TRAINS_DELETE', 'Xóa tàu', 'trains', 'delete', 'DELETE', '/trains/:id'],
    [
      'SEAT_TYPES_CREATE',
      'Tạo loại ghế',
      'seat-types',
      'create',
      'POST',
      '/seat-types'
    ],
    [
      'SEAT_TYPES_READ',
      'Xem loại ghế',
      'seat-types',
      'read',
      'GET',
      '/seat-types'
    ],
    [
      'SEAT_TYPES_UPDATE',
      'Cập nhật loại ghế',
      'seat-types',
      'update',
      'PATCH',
      '/seat-types/:id'
    ],
    [
      'SEAT_TYPES_DELETE',
      'Vô hiệu hóa loại ghế',
      'seat-types',
      'delete',
      'DELETE',
      '/seat-types/:id'
    ],
    [
      'CARRIAGES_CREATE',
      'Tạo toa',
      'carriages',
      'create',
      'POST',
      '/trains/:trainId/carriages'
    ],
    [
      'CARRIAGES_READ',
      'Xem danh sách toa của tàu',
      'carriages',
      'read',
      'GET',
      '/trains/:trainId/carriages'
    ],
    [
      'CARRIAGES_READ_DETAIL',
      'Xem chi tiết toa',
      'carriages',
      'read',
      'GET',
      '/carriages/:id'
    ],
    [
      'CARRIAGES_UPDATE',
      'Cập nhật toa',
      'carriages',
      'update',
      'PATCH',
      '/carriages/:id'
    ],
    [
      'CARRIAGES_DELETE',
      'Xóa toa',
      'carriages',
      'delete',
      'DELETE',
      '/carriages/:id'
    ],
    [
      'SEATS_CREATE',
      'Tạo ghế',
      'seats',
      'create',
      'POST',
      '/carriages/:carriageId/seats'
    ],
    [
      'SEATS_READ',
      'Xem danh sách ghế của toa',
      'seats',
      'read',
      'GET',
      '/carriages/:carriageId/seats'
    ],
    [
      'SEATS_READ_DETAIL',
      'Xem chi tiết ghế',
      'seats',
      'read',
      'GET',
      '/seats/:id'
    ],
    ['SEATS_UPDATE', 'Cập nhật ghế', 'seats', 'update', 'PATCH', '/seats/:id'],
    ['SEATS_DELETE', 'Xóa ghế', 'seats', 'delete', 'DELETE', '/seats/:id']
  ] as const;

  for (const [code, name, module, action, method, path] of permissions) {
    await prisma.permission.upsert({
      where: { code },
      update: {
        name,
        module,
        action,
        method,
        path,
        status: PermissionStatus.ACTIVE
      },
      create: {
        code,
        name,
        module,
        action,
        method,
        path,
        status: PermissionStatus.ACTIVE
      }
    });
  }

  const superAdminRole = await prisma.role.findUnique({
    where: { code: 'SUPER_ADMIN' }
  });

  if (superAdminRole) {
    const allPermissions = await prisma.permission.findMany({
      where: {
        code: {
          in: permissions.map(([code]) => code)
        }
      }
    });

    await prisma.rolePermission.createMany({
      data: allPermissions.map((permission) => ({
        roleId: superAdminRole.id,
        permissionId: permission.id
      })),
      skipDuplicates: true
    });
  }

  console.log(`Đã seed ${roles.length} vai trò.`);
  console.log(`Đã seed ${permissions.length} quyền.`);

  if (superAdminRole) {
    const passwordHash = await bcrypt.hash('Admin-sSjRqGa9JH-6#1', 12);
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@traintickets.local' },
      update: {
        fullName: 'System Admin',
        passwordHash,
        userType: UserType.STAFF,
        status: UserStatus.ACTIVE,
        deletedAt: null
      },
      create: {
        email: 'admin@traintickets.local',
        fullName: 'System Admin',
        passwordHash,
        userType: UserType.STAFF,
        status: UserStatus.ACTIVE
      }
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: superAdminRole.id
        }
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: superAdminRole.id
      }
    });

    console.log('Đã seed tài khoản admin SUPER_ADMIN.');
  }

  const stations = [
    {
      code: 'HAN',
      name: 'Ga Hà Nội',
      slug: 'ga-ha-noi',
      city: 'Hà Nội'
    },
    {
      code: 'VIN',
      name: 'Ga Vinh',
      slug: 'ga-vinh',
      city: 'Nghệ An'
    },
    {
      code: 'DAD',
      name: 'Ga Đà Nẵng',
      slug: 'ga-da-nang',
      city: 'Đà Nẵng'
    }
  ];

  for (const station of stations) {
    await prisma.station.upsert({
      where: { code: station.code },
      update: {
        ...station,
        status: StationStatus.ACTIVE,
        deletedAt: null
      },
      create: {
        ...station,
        status: StationStatus.ACTIVE
      }
    });
  }

  console.log(`Đã seed ${stations.length} ga.`);

  const routeStations = await prisma.station.findMany({
    where: {
      code: {
        in: ['HAN', 'VIN', 'DAD']
      },
      deletedAt: null
    }
  });
  const stationByCode = new Map(
    routeStations.map((station) => [station.code, station])
  );
  const han = stationByCode.get('HAN');
  const vin = stationByCode.get('VIN');
  const dad = stationByCode.get('DAD');

  if (han && vin && dad) {
    const route = await prisma.route.upsert({
      where: { code: 'HN-DN' },
      update: {
        name: 'Hà Nội - Đà Nẵng',
        description: 'Tuyến mẫu Hà Nội - Vinh - Đà Nẵng.',
        status: RouteStatus.ACTIVE,
        deletedAt: null
      },
      create: {
        code: 'HN-DN',
        name: 'Hà Nội - Đà Nẵng',
        description: 'Tuyến mẫu Hà Nội - Vinh - Đà Nẵng.',
        status: RouteStatus.ACTIVE
      }
    });

    await prisma.routeStop.deleteMany({
      where: { routeId: route.id }
    });

    await prisma.routeStop.createMany({
      data: [
        {
          routeId: route.id,
          stationId: han.id,
          stopOrder: 1,
          distanceFromStartKm: 0,
          defaultArrivalOffsetMinutes: null,
          defaultDepartureOffsetMinutes: 0
        },
        {
          routeId: route.id,
          stationId: vin.id,
          stopOrder: 2,
          distanceFromStartKm: 319,
          defaultArrivalOffsetMinutes: 360,
          defaultDepartureOffsetMinutes: 370
        },
        {
          routeId: route.id,
          stationId: dad.id,
          stopOrder: 3,
          distanceFromStartKm: 791,
          defaultArrivalOffsetMinutes: 900,
          defaultDepartureOffsetMinutes: null
        }
      ]
    });

    console.log('Đã seed tuyến HN-DN.');
  }

  const seatTypes = [
    {
      code: 'HARD_SEAT',
      name: 'Ghế cứng',
      description: 'Ghế cứng tiêu chuẩn.',
      baseMultiplier: 1
    },
    {
      code: 'SOFT_SEAT',
      name: 'Ghế mềm',
      description: 'Ghế mềm điều hòa.',
      baseMultiplier: 1.2
    },
    {
      code: 'SLEEPER_4',
      name: 'Giường nằm khoang 4',
      description: 'Giường nằm khoang 4 điều hòa.',
      baseMultiplier: 1.8
    }
  ];

  for (const seatType of seatTypes) {
    await prisma.seatType.upsert({
      where: { code: seatType.code },
      update: {
        ...seatType,
        status: SeatTypeStatus.ACTIVE
      },
      create: {
        ...seatType,
        status: SeatTypeStatus.ACTIVE
      }
    });
  }

  const train = await prisma.train.upsert({
    where: { code: 'SE1' },
    update: {
      name: 'Tàu SE1',
      description: 'Tàu mẫu phục vụ test cấu hình toa và ghế.',
      status: TrainStatus.ACTIVE,
      deletedAt: null
    },
    create: {
      code: 'SE1',
      name: 'Tàu SE1',
      description: 'Tàu mẫu phục vụ test cấu hình toa và ghế.',
      status: TrainStatus.ACTIVE
    }
  });

  const softSeat = await prisma.seatType.findUnique({
    where: { code: 'SOFT_SEAT' }
  });
  const sleeper4 = await prisma.seatType.findUnique({
    where: { code: 'SLEEPER_4' }
  });

  const carriage1 = await prisma.carriage.upsert({
    where: {
      trainId_carriageNumber: {
        trainId: train.id,
        carriageNumber: 1
      }
    },
    update: {
      name: 'Toa 1 ghế ngồi',
      carriageType: 'SEAT',
      seatMapLayout: { rows: 2, columns: 2 },
      status: CarriageStatus.ACTIVE,
      deletedAt: null
    },
    create: {
      trainId: train.id,
      carriageNumber: 1,
      name: 'Toa 1 ghế ngồi',
      carriageType: 'SEAT',
      seatMapLayout: { rows: 2, columns: 2 },
      status: CarriageStatus.ACTIVE
    }
  });

  const carriage2 = await prisma.carriage.upsert({
    where: {
      trainId_carriageNumber: {
        trainId: train.id,
        carriageNumber: 2
      }
    },
    update: {
      name: 'Toa 2 giường nằm',
      carriageType: 'SLEEPER',
      seatMapLayout: { rooms: 1, bedsPerRoom: 4 },
      status: CarriageStatus.ACTIVE,
      deletedAt: null
    },
    create: {
      trainId: train.id,
      carriageNumber: 2,
      name: 'Toa 2 giường nằm',
      carriageType: 'SLEEPER',
      seatMapLayout: { rooms: 1, bedsPerRoom: 4 },
      status: CarriageStatus.ACTIVE
    }
  });

  if (softSeat) {
    for (const seatNumber of ['A1', 'A2', 'B1', 'B2']) {
      await prisma.seat.upsert({
        where: {
          carriageId_seatNumber: {
            carriageId: carriage1.id,
            seatNumber
          }
        },
        update: {
          seatTypeId: softSeat.id,
          status: SeatStatus.ACTIVE,
          deletedAt: null
        },
        create: {
          carriageId: carriage1.id,
          seatTypeId: softSeat.id,
          seatNumber,
          status: SeatStatus.ACTIVE
        }
      });
    }
  }

  if (sleeper4) {
    for (const [seatNumber, floorNumber] of [
      ['1A', 1],
      ['1B', 2],
      ['1C', 1],
      ['1D', 2]
    ] as const) {
      await prisma.seat.upsert({
        where: {
          carriageId_seatNumber: {
            carriageId: carriage2.id,
            seatNumber
          }
        },
        update: {
          seatTypeId: sleeper4.id,
          floorNumber,
          status: SeatStatus.ACTIVE,
          deletedAt: null
        },
        create: {
          carriageId: carriage2.id,
          seatTypeId: sleeper4.id,
          seatNumber,
          floorNumber,
          status: SeatStatus.ACTIVE
        }
      });
    }
  }

  console.log(`Đã seed ${seatTypes.length} loại ghế.`);
  console.log('Đã seed tàu SE1, 2 toa và ghế mẫu.');
}

void main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
