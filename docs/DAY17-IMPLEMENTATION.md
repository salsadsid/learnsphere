# Day 17 Implementation

Goal: add refresh token flow with rotation and revoke list.

## Refresh Token Flow

- Route: `POST /api/v1/auth/refresh`
- Validates refresh token input.
- Issues a new access token and rotates refresh token.

## Logout

- Route: `POST /api/v1/auth/logout`
- Revokes refresh token.

## In-Memory Revoke List

- Refresh tokens are tracked in memory.
- Rotation revokes old tokens and issues new ones.

## Verification Checklist

- [x] Refresh endpoint added
- [x] Rotation implemented
- [x] Logout revokes refresh token

## Status
Implemented:
- [x] apps/api/src/modules/auth/infra/refresh-token-store.ts
- [x] apps/api/src/modules/auth/http/routes.ts
- [x] apps/api/src/modules/auth/http/validation.ts
- [x] apps/api/src/modules/auth/infra/user-store.ts
- [x] apps/api/src/modules/auth/http/dto.ts
