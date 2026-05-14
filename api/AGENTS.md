# Train Tickets API - Agent Context

This folder contains the NestJS backend for a train ticketing system. Read this file first when working inside `api/`.

## Tech Stack

- NestJS 11
- Prisma 6
- MySQL
- JWT auth with access/refresh tokens
- Swagger/OpenAPI in development
- Global `ValidationPipe`
- Global exception filter
- Global response interceptor

Common commands:

```bash
npm run prisma:generate
npm run build
npm run lint
npm run format
npm run prisma:deploy
npm run prisma:seed
```

Swagger:

- UI: `http://localhost:3000/docs`
- JSON: `http://localhost:3000/docs-json`
- Swagger is enabled only when `NODE_ENV=development`.

## Project Conventions

### Response Envelope

All successful responses are wrapped by `TransformResponseInterceptor`:

```json
{
  "success": true,
  "data": {},
  "meta": {},
  "message": "Thành công"
}
```

Service methods may return:

```ts
{ data, meta, message }
{ message }
```

Mutating endpoints (`POST`, `PATCH`, `DELETE`) should return message only, not full records. Auth is an exception because login/register/refresh must return tokens.

List endpoints should return summary records and pagination meta. Avoid large nested data in list responses. Detail endpoints may include richer nested data when useful.

### Error Envelope

All errors are normalized by `AllExceptionsFilter`:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Vietnamese message safe to show in UI",
    "details": []
  }
}
```

Use `AppException` for business errors with stable `error.code`. DTO validation errors are created by `createValidationException` and use `VALIDATION_ERROR` unless a specific code is handled.

Important existing codes include:

- `VALIDATION_ERROR`
- `INTERNAL_ERROR`
- `AUTH_INVALID_CREDENTIALS`
- `AUTH_TOKEN_EXPIRED`
- `USER_CONTACT_REQUIRED`
- `USER_EMAIL_DUPLICATED`
- `USER_PHONE_DUPLICATED`
- `USER_ROLE_NOT_FOUND`
- `TRAIN_CODE_DUPLICATED`
- `CARRIAGE_NUMBER_DUPLICATED`
- `CARRIAGE_TYPE_INVALID`
- `SEAT_NUMBER_DUPLICATED`
- `SEAT_TYPE_NOT_ALLOWED_FOR_CARRIAGE`
- `SEAT_TYPE_INACTIVE`
- `ROUTE_STOP_DUPLICATED`
- `ROUTE_MUST_HAVE_AT_LEAST_TWO_STOPS`
- `STATION_CODE_DUPLICATED`
- `ROLE_CODE_DUPLICATED`
- `PERMISSION_CODE_DUPLICATED`

Do not introduce vague messages like `Bad request`, `Internal server error`, or `Validation failed` for business cases.

### Auth And Permissions

JWT contains identity only:

- `sub`
- `email`
- `phone`
- `userType`

Permissions are never stored in JWT. Runtime permission check reads DB:

`user -> user_roles -> role -> role_permissions -> permission`

Controllers that require CMS access should use:

```ts
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
```

Then annotate handlers with:

```ts
@RequirePermissions('SOME_PERMISSION_CODE')
```

`PermissionsGuard` checks:

- user active and not soft-deleted
- role active
- permission active
- HTTP method
- route path
- permission code

Permission seed lives in `prisma/seed.ts`.

### ID Policy

Business/domain entities use UUID string IDs:

- `users.id`
- `stations.id`
- `routes.id`
- `route_stops.id`
- `trains.id`
- `seat_types.id`
- `carriages.id`
- `seats.id`

Role and permission IDs remain numeric `BigInt`:

- `roles.id`
- `permissions.id`
- `role_permissions`
- internal IDs such as `refresh_tokens.id`, `audit_logs.id`, `user_roles.id`

Use `ParseUUIDPipe` for UUID params and `ParsePositiveIntPipe` for numeric role/permission IDs.

## Implemented Modules

### Health

- `GET /health`

### Auth

Endpoints:

- `POST /cms/auth/login`
- `POST /cms/auth/refresh`
- `POST /cms/auth/logout`
- `GET /cms/auth/me`
- `POST /client/auth/register`
- `POST /client/auth/login`
- `POST /client/auth/refresh`
- `POST /client/auth/logout`
- `GET /client/auth/me`

Auth returns tokens and user profile. CMS auth only allows `STAFF` and `SYSTEM`; client auth only allows `CUSTOMER`. Login invalid credentials use `AUTH_INVALID_CREDENTIALS`. Expired/invalid token cases use auth error codes.

### Users

Endpoints:

- `POST /cms/users`
- `GET /cms/users`
- `GET /cms/users/:id`
- `PATCH /cms/users/:id`
- `DELETE /cms/users/:id`

Permissions:

- `USERS_CREATE`
- `USERS_READ`
- `USERS_UPDATE`
- `USERS_DELETE`

Notes:

- `GET /cms/users` supports `page`, `limit`, `search`, `userType`, `status`.
- List returns user summary and short role objects.
- Detail returns user detail and roles, but not large permission trees.
- Create/update validates email or phone is present.
- Create/update validates email/phone uniqueness among non-deleted users.
- `roleIds` must point to active roles.
- Delete is soft delete: set `deletedAt` and `status = INACTIVE`.

### Roles

Endpoints:

- `GET /cms/roles`
- `POST /cms/roles`
- `GET /cms/roles/:id`
- `PATCH /cms/roles/:id`
- `PATCH /cms/roles/:id/permissions`
- `DELETE /cms/roles/:id`

Role IDs are numeric. Use `ParsePositiveIntPipe`. Delete means deactivate.

### Permissions

Endpoints:

- `GET /cms/permissions`
- `POST /cms/permissions`
- `GET /cms/permissions/:id`
- `PATCH /cms/permissions/:id`
- `DELETE /cms/permissions/:id`

Permission IDs are numeric. Use `ParsePositiveIntPipe`. Delete means deactivate.

### Stations

Endpoints:

- `POST /cms/stations`
- `GET /cms/stations`
- `GET /cms/stations/:id`
- `PATCH /cms/stations/:id`
- `DELETE /cms/stations/:id`

Stations use UUID IDs. Delete is soft delete. List supports pagination/filtering.

### Routes

Endpoints:

- `POST /cms/routes`
- `GET /cms/routes`
- `GET /cms/routes/:id`
- `PATCH /cms/routes/:id`
- `DELETE /cms/routes/:id`

Routes and route stops use UUID IDs. Create/update route supports nested stops.

Route stop validation:

- at least 2 stops
- no duplicated `stopOrder`
- no duplicated `stationId`
- `distanceFromStartKm` increases by `stopOrder`
- each station exists, is not soft-deleted, and is `ACTIVE`

List routes do not return stops. Detail routes include stops and station data.

### Trains, Seat Types, Carriages, Seats

Implemented under `src/modules/trains`.

Train endpoints:

- `POST /cms/trains`
- `GET /cms/trains`
- `GET /cms/trains/:id`
- `PATCH /cms/trains/:id`
- `DELETE /cms/trains/:id`

Seat type endpoints:

- `POST /cms/seat-types`
- `GET /cms/seat-types`
- `GET /cms/seat-types/:id`
- `PATCH /cms/seat-types/:id`
- `DELETE /cms/seat-types/:id`

Carriage endpoints:

- `POST /cms/trains/:trainId/carriages`
- `GET /cms/trains/:trainId/carriages`
- `GET /cms/carriages/:id`
- `PATCH /cms/carriages/:id`
- `DELETE /cms/carriages/:id`

Seat endpoints:

- `POST /cms/carriages/:carriageId/seats`
- `GET /cms/carriages/:carriageId/seats`
- `GET /cms/seats/:id`
- `PATCH /cms/seats/:id`
- `DELETE /cms/seats/:id`

Important domain rules:

- `TrainStatus`: `ACTIVE`, `MAINTENANCE`, `INACTIVE`
- `CarriageType`: `SEAT`, `SLEEPER`, `VIP`
- `CarriageStatus`: `ACTIVE`, `MAINTENANCE`, `INACTIVE`
- `SeatStatus`: `ACTIVE`, `BROKEN`, `INACTIVE`
- `SeatTypeStatus`: `ACTIVE`, `INACTIVE`
- `seat_types.allowedCarriageTypes` controls which carriage types can use a seat type.
- Creating/updating a seat validates that the selected seat type is active and allowed for the carriage type.
- Updating a carriage type validates existing seats remain compatible.
- Trains/carriages/seats use soft delete.
- Seat types do not have `deletedAt`; delete means set `status = INACTIVE`.
- Reusing a carriage number or seat number after soft delete is allowed. DB uses non-unique indexes for these pairs, and services enforce uniqueness only where `deletedAt = null`.

## Database And Migrations

Prisma schema: `prisma/schema.prisma`

Migrations are in `prisma/migrations`.

Use:

```bash
npm run prisma:generate
npm run prisma:deploy
```

Do not edit an already-applied migration unless explicitly recovering a failed local migration. Add a new migration for schema changes.

## Seed Data

Seed file: `prisma/seed.ts`

Seed currently creates:

- roles: `SUPER_ADMIN`, `OPERATOR`, `CUSTOMER`
- permissions for users, roles, permissions, stations, routes, trains, seat types, carriages, seats
- admin account:
  - email: `admin@traintickets.local`
  - password: `Admin-sSjRqGa9JH-6#1`
  - role: `SUPER_ADMIN`
- stations: `HAN`, `VIN`, `DAD`
- route `HN-DN`
- seat types: `HARD_SEAT`, `SOFT_SEAT`, `SLEEPER_4`
- train `SE1`, 2 carriages, and sample seats

Run:

```bash
npm run prisma:seed
```

## Development Notes For Future Agents

- Follow existing module structure: controller, service, DTOs inside `src/modules/<feature>`.
- Prefer `AppException` for predictable FE error handling.
- Add Swagger decorators for new endpoints: `ApiTags`, `ApiBearerAuth`, `ApiOperation`, `ApiBody`, `ApiQuery`, `ApiParam`, `ApiOkResponse`, `ApiUnauthorizedResponse`, `ApiForbiddenResponse`.
- For Swagger query params, specify `type: Number/String` or `enum` to avoid object rendering.
- Keep mutation responses short: message only.
- Keep list responses summary-only with pagination meta.
- Soft delete domain entities where existing modules already do so.
- Always update `prisma/seed.ts` when adding new permissions.
- Always run at least `npm run build` and `npm run lint`; when touching Prisma, also run `npm run prisma:generate`, `npm run prisma:deploy`, and `npm run prisma:seed` if DB is available.
