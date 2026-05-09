# Phase 00 - Setup cấu trúc source NestJS

Phase này chưa xử lý nghiệp vụ. Mục tiêu là tạo nền dự án backend ổn định để các module sau phát triển nhất quán.

## Công nghệ đề xuất

- Runtime: Node.js LTS
- Framework: NestJS
- Database: MySQL 8.x
- ORM: Prisma hoặc TypeORM
- Queue: BullMQ
- Queue storage: Redis
- Validation: `class-validator`, `class-transformer`
- Config: `@nestjs/config`
- Auth: JWT access token và refresh token
- API docs: Swagger/OpenAPI
- Logger: Pino hoặc Winston

Khuyến nghị hiện tại: **NestJS + Prisma + MySQL + Redis + BullMQ**.

## Cấu trúc thư mục đề xuất

```txt
api/
  docs/
  src/
    main.ts
    app.module.ts
    common/
      constants/
      decorators/
      dto/
      enums/
      exceptions/
      filters/
      guards/
      interceptors/
      pipes/
      utils/
    config/
      app.config.ts
      database.config.ts
      redis.config.ts
      jwt.config.ts
      queue.config.ts
    database/
      prisma/
      migrations/
      seeds/
    modules/
      auth/
      users/
      audit-logs/
      stations/
      routes/
      trains/
      trips/
      fares/
      seat-holds/
      bookings/
      payments/
      tickets/
      notifications/
    workers/
      queues/
      processors/
    health/
  test/
  .env.example
  package.json
```

## Ý nghĩa các thư mục chính

### `src/common`

Chứa code dùng chung toàn backend.

- `constants`: hằng số như tên queue, role mặc định, pagination default.
- `decorators`: decorator như `@CurrentUser()`, `@Roles()`.
- `dto`: DTO chung như pagination query, response metadata.
- `enums`: enum dùng chung như trạng thái active/inactive.
- `exceptions`: exception tùy chỉnh.
- `filters`: global exception filter.
- `guards`: JWT guard, role guard.
- `interceptors`: response transform, logging, timeout.
- `pipes`: parse/validate pipe tùy chỉnh.
- `utils`: helper thuần, không phụ thuộc NestJS.

### `src/config`

Chứa cấu hình đọc từ environment variables.

- `app.config.ts`: port, app env, app URL.
- `database.config.ts`: MySQL host, port, user, password, database.
- `redis.config.ts`: Redis connection.
- `jwt.config.ts`: secret, expires in.
- `queue.config.ts`: queue prefix, concurrency mặc định.

### `src/database`

Chứa cấu hình ORM, migration và seed.

- Nếu dùng Prisma: đặt `schema.prisma`, migrations và seed ở đây hoặc theo chuẩn `prisma/`.
- Nếu dùng TypeORM: đặt entity, migration và datasource config.

### `src/modules`

Mỗi nghiệp vụ là một module riêng. Không gom quá nhiều logic vào một service lớn.

Thứ tự module nên triển khai:

1. `auth`, `users`, `audit-logs`
2. `stations`
3. `routes`
4. `trains`
5. `trips`
6. `fares`
7. `seat-holds`
8. `bookings`
9. `payments`
10. `tickets`
11. `notifications`

### `src/workers`

Chứa queue processor chạy background.

Các job MVP:

- Hết hạn giữ ghế.
- Hết hạn booking chờ thanh toán.
- Gửi email vé.
- Đối soát payment pending.

## Chuẩn API response

Nên thống nhất response ngay từ đầu.

```json
{
  "success": true,
  "data": {},
  "meta": {},
  "message": "Thành công"
}
```

Với lỗi:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": []
  }
}
```

## Environment variables tối thiểu

```txt
NODE_ENV=development
APP_PORT=3000
APP_URL=http://localhost:3000

DATABASE_URL=mysql://user:password@localhost:3306/train_tickets

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

JWT_ACCESS_SECRET=change_me
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change_me
JWT_REFRESH_EXPIRES_IN=30d
```

## Tiêu chí hoàn thành phase

- Dự án NestJS chạy được ở local.
- Kết nối MySQL thành công.
- Có health check.
- Có config module.
- Có validation pipe global.
- Có exception filter global.
- Có Swagger ở môi trường development.
- Có `.env.example`.
- Có script migration và seed.

