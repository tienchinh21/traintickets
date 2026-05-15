# API Auth, Security, And Errors

## JWT And Sessions

JWT access tokens contain identity only:

- `sub`
- `email`
- `phone`
- `userType`

JWT does not contain roles or permissions. Runtime authorization reads database state.

Current session behavior:

- Login revokes existing active refresh tokens for the same user before issuing a new refresh token.
- Refresh revokes the submitted refresh token and issues a new access/refresh pair.
- Logout revokes the submitted refresh token.

## Guards

CMS controllers usually use:

```ts
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
```

Handlers then use:

```ts
@RequirePermissions('SOME_PERMISSION_CODE')
```

`PermissionsGuard` checks database state for:

- authenticated user ID from JWT `sub`
- active, non-deleted user
- active role
- active permission matching the required permission code

`RolesGuard` is available for role-based checks and also reads roles from the database at runtime. Prefer `PermissionsGuard` for CMS features unless the existing code in that area uses role checks.

## Environment Security

- `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are required and must not be `change_me`.
- `JWT_ACCESS_EXPIRES_IN` defaults to `15m`.
- `JWT_REFRESH_EXPIRES_IN` defaults to `30d`.
- `CORS_ORIGINS` is a comma-separated allowlist. Empty value disables browser origins.

## Errors

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
