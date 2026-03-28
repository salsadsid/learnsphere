# Day 22 Implementation

Goal: add rate limiting to auth endpoints and log auth actions.

## Rate Limiting

- Added a simple in-memory limiter middleware.
- Applied to `/api/v1/auth/register` and `/api/v1/auth/login`.

## Audit Logs

- Added an in-memory audit log store.
- Logged successful register/login/refresh/logout actions.

## Verification Checklist

- [x] Register/login requests are throttled after repeated attempts.
- [x] Successful auth actions create audit log entries.

## Status
Implemented:
- [x] apps/api/src/shared/rate-limit.ts
- [x] apps/api/src/modules/auth/infra/audit-log-store.ts
- [x] apps/api/src/modules/auth/http/routes.ts
