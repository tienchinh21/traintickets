# API Domain Rules

Use this file for behavior that is easy to break during refactors.

## ID Policy

Business/domain entities use UUID string IDs:

- `users.id`
- `stations.id`
- `routes.id`
- `route_stops.id`
- `trains.id`
- `seat_types.id`
- `carriages.id`
- `seats.id`
- `trips.id`
- `trip_stops.id`

Role and permission IDs remain numeric `BigInt`:

- `roles.id`
- `permissions.id`
- `role_permissions`
- internal IDs such as `refresh_tokens.id`, `audit_logs.id`, `user_roles.id`

Use `ParseUUIDPipe` for UUID params and `ParsePositiveIntPipe` for numeric role/permission IDs.

## Soft Delete

- Users: set `deletedAt` and `status = INACTIVE`.
- Stations: set `deletedAt` and `status = INACTIVE`.
- Routes: set `deletedAt` and `status = INACTIVE`.
- Trains: set `deletedAt` and `status = INACTIVE`.
- Carriages: set `deletedAt` and `status = INACTIVE`.
- Seats: set `deletedAt` and `status = INACTIVE`.
- Trips: set `deletedAt` and `status = CANCELLED`.
- Roles, permissions, and seat types do not use `deletedAt`; delete means deactivate/inactivate.

Uniqueness checks for soft-deleted domain entities should usually scope to `deletedAt = null` unless the schema has a hard unique constraint.

## Users

- Create/update requires at least email or phone.
- Email and phone uniqueness is checked among non-deleted users in services.
- `roleIds` must point to active roles.
- List responses return summary data and short role objects.
- Detail responses include roles but should not include large permission trees.

## Routes

Route stop validation:

- at least 2 stops
- no duplicated `stopOrder`
- no duplicated `stationId`
- `distanceFromStartKm` increases by `stopOrder`
- each station exists, is not soft-deleted, and is `ACTIVE`

List routes do not return stops. Detail routes include stops and station data.

## Trains And Seats

Important enums:

- `TrainStatus`: `ACTIVE`, `MAINTENANCE`, `INACTIVE`
- `CarriageType`: `SEAT`, `SLEEPER`, `VIP`
- `CarriageStatus`: `ACTIVE`, `MAINTENANCE`, `INACTIVE`
- `SeatStatus`: `ACTIVE`, `BROKEN`, `INACTIVE`
- `SeatTypeStatus`: `ACTIVE`, `INACTIVE`

Seat rules:

- `seat_types.allowedCarriageTypes` controls which carriage types can use a seat type.
- Creating/updating a seat validates the selected seat type is active and allowed for the carriage type.
- Updating a carriage type validates existing seats remain compatible.
- Reusing a carriage number or seat number after soft delete is allowed where services enforce uniqueness with `deletedAt = null`.

## Trips

- Trips are generated from a route and train for a service date/time.
- Trip stops are copied from route stops and ordered by `stopOrder`.
- Search by from/to stations must ensure both stations are present and `fromStop.stopOrder < toStop.stopOrder`.
- Delete is soft delete and sets `status = CANCELLED`.

## Seed Data

Seed file: `prisma/seed.ts`.

Seed currently creates core roles, permission codes, an admin account, stations, route `HN-DN`, seat types, train `SE1`, carriages, and sample seats. Keep seed permissions in sync with controller decorators.
