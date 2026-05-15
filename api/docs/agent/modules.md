# API Module Reference

This file gives agents a module map. Prefer Swagger and controllers as the source of truth for exact request/response shapes.

## Health

- `GET /health`

## Auth

CMS endpoints:

- `POST /cms/auth/login`
- `POST /cms/auth/refresh`
- `POST /cms/auth/logout`
- `GET /cms/auth/me`

Client endpoints:

- `POST /client/auth/register`
- `POST /client/auth/login`
- `POST /client/auth/refresh`
- `POST /client/auth/logout`
- `GET /client/auth/me`

CMS auth allows `STAFF` and `SYSTEM`. Client auth allows `CUSTOMER`.

## Users

Base path: `/cms/users`

Endpoints: create, list, detail, update, delete.

Permissions:

- `USERS_CREATE`
- `USERS_READ`
- `USERS_UPDATE`
- `USERS_DELETE`

List supports `page`, `limit`, `search`, `userType`, and `status`.

## Roles

Base path: `/cms/roles`

Endpoints: create, list, detail, update, sync permissions, delete/deactivate.

Role IDs are numeric and use `ParsePositiveIntPipe`.

Permissions include `ROLES_CREATE`, `ROLES_READ`, `ROLES_UPDATE`, `ROLES_SYNC_PERMISSIONS`, and `ROLES_DELETE`.

## Permissions

Base path: `/cms/permissions`

Endpoints: create, list, detail, update, delete/deactivate.

Permission IDs are numeric and use `ParsePositiveIntPipe`.

Permissions include `PERMISSIONS_CREATE`, `PERMISSIONS_READ`, `PERMISSIONS_UPDATE`, and `PERMISSIONS_DELETE`.

## Stations

Base path: `/cms/stations`

Endpoints: create, list, detail, update, delete.

Stations use UUID IDs. List supports pagination and filtering.

Permissions include `STATIONS_CREATE`, `STATIONS_READ`, `STATIONS_UPDATE`, and `STATIONS_DELETE`.

## Routes

Base path: `/cms/routes`

Endpoints: create, list, generate code, detail, update, delete.

Routes and route stops use UUID IDs. Create/update supports nested stops.

Permissions include `ROUTES_CREATE`, `ROUTES_READ`, `ROUTES_UPDATE`, and `ROUTES_DELETE`.

## Trains, Seat Types, Carriages, Seats

Implemented under `src/modules/trains`.

Train base path: `/cms/trains`.
Seat type base path: `/cms/seat-types`.
Carriage paths include `/cms/trains/:trainId/carriages` and `/cms/carriages/:id`.
Seat paths include `/cms/carriages/:carriageId/seats` and `/cms/seats/:id`.

Permissions include `TRAINS_*`, `SEAT_TYPES_*`, `CARRIAGES_*`, and `SEATS_*`. Some detail endpoints use `*_READ_DETAIL`.

## Trips

Base path: `/cms/trips`

Endpoints:

- `POST /cms/trips`
- `GET /cms/trips`
- `POST /cms/trips/generate-code`
- `POST /cms/trips/search`
- `GET /cms/trips/:id`
- `PATCH /cms/trips/:id`
- `DELETE /cms/trips/:id`

Permissions include `TRIPS_CREATE`, `TRIPS_READ`, `TRIPS_GENERATE_CODE`, `TRIPS_UPDATE`, and `TRIPS_DELETE`.

## Administrative Divisions

Base path: `/administrative-divisions`

Public read endpoints expose local/openapi administrative division datasets:

- `GET /administrative-divisions/summary`
- `GET /administrative-divisions/old/provinces`
- `GET /administrative-divisions/old/provinces/:code`
- `GET /administrative-divisions/old/districts`
- `GET /administrative-divisions/old/districts/:code`
- `GET /administrative-divisions/old/wards`
- `GET /administrative-divisions/old/wards/:code`
- `GET /administrative-divisions/2025/provinces`
- `GET /administrative-divisions/2025/provinces/:code`
- `GET /administrative-divisions/2025/wards`
- `GET /administrative-divisions/2025/wards/from-legacy`
- `GET /administrative-divisions/2025/wards/:code/to-legacies`
- `GET /administrative-divisions/2025/wards/:code`
- `GET /administrative-divisions/openapi/:version`
