# Train Tickets API - Agent Guide

Read this first when changing code inside `api/`. Keep this file short and operational. Detailed references live under `docs/agent/`.

## Stack And Commands

- NestJS 11, Prisma 6, MySQL.
- JWT access/refresh auth.
- Swagger is available in development at `http://localhost:3000/docs`.
- Global `ValidationPipe`, `AllExceptionsFilter`, and `TransformResponseInterceptor` are configured in `src/main.ts`.

Use verification commands that do not mutate files first:

```bash
npm run typecheck
npm run lint:check
npm run build
```

Use `npm run lint` or `npm run format` only when you intentionally want auto-fixes. When touching Prisma, also run `npm run prisma:generate`; run migrations/seed only when a database is available.

## Must Follow

- Match existing module structure: controller, service, and DTOs under `src/modules/<feature>`.
- Use DTO validation for request input. Do not validate request bodies ad hoc in controllers.
- Successful responses are wrapped by `TransformResponseInterceptor`.
- Service methods should return `{ data, meta, message }` for explicit envelopes and `{ message }` for mutations. Auth is an exception because token endpoints return tokens.
- Use `AppException` for business errors with stable `error.code` and Vietnamese UI-safe messages.
- Do not return vague business errors like `Bad request`, `Internal server error`, or `Validation failed`.
- JWT payload contains identity only: `sub`, `email`, `phone`, `userType`.
- Permissions and roles are checked from the database at runtime, never from JWT claims.
- CMS controllers usually use `@UseGuards(JwtAuthGuard, PermissionsGuard)` and `@RequirePermissions(...)`.
- Use `ParseUUIDPipe` for UUID params and `ParsePositiveIntPipe` for numeric role/permission IDs.
- Mutating endpoints should return message-only responses unless existing behavior requires data.
- List endpoints should return summary records plus pagination meta. Detail endpoints may include richer nested data.
- Soft delete domain entities consistently with existing services: set `deletedAt` and inactive/cancelled status where the model has status.
- Add/update `prisma/seed.ts` when adding new permission codes.
- Do not edit an already-applied migration unless explicitly recovering a failed local migration. Add a new migration for schema changes.

## Runtime Contracts

Response envelope:

```json
{
  "success": true,
  "data": {},
  "meta": {},
  "message": "Thành công"
}
```

Error envelope:

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

Important env behavior:

- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are required. The API fails fast if they are missing or still equal `change_me`.
- `CORS_ORIGINS` is a comma-separated allowlist. If it is empty, browser origins are not allowed.

Auth session behavior:

- Login currently revokes existing active refresh tokens for the same user before issuing a new refresh token.
- Refresh rotates the submitted refresh token: the used token is revoked and a new one is issued.

## References

- Module and endpoint summary: `docs/agent/modules.md`
- Domain rules and data policies: `docs/agent/domain-rules.md`
- Error codes, auth, guards, and security notes: `docs/agent/security-auth.md`
- Schema planning docs: `docs/README.md`
- Prisma schema: `prisma/schema.prisma`
- Seed data and permissions: `prisma/seed.ts`
