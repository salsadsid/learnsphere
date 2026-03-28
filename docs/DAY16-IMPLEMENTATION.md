# Day 16 Implementation

Goal: implement login endpoint and issue access token (JWT).

## Login Endpoint

- Route: `POST /api/v1/auth/login`
- Validates input using Zod schema.
- Verifies password hash with bcryptjs.
- Issues a JWT access token.

## Token Details

- Access token expires in 3600 seconds.
- Token payload includes `sub`, `email`, and `role`.

## Verification Checklist

- [x] Login route created
- [x] Password verification implemented
- [x] JWT access token issued

## Status
Implemented:
- [x] apps/api/src/modules/auth/http/routes.ts
- [x] apps/api/src/modules/auth/use-cases/login-user.ts
- [x] apps/api/src/modules/auth/infra/token.ts
- [x] apps/api/package.json
- [x] apps/api/src/shared/config.ts
- [x] apps/api/.env.example
