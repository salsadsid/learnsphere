# Day 23 Implementation

Goal: add basic auth API tests and frontend smoke tests.

## API Tests

- Added vitest + supertest setup.
- Added a single happy-path auth flow test.

## Frontend Smoke Tests

- Added vitest + testing-library setup.
- Added login/register page render tests.

## Verification Checklist

- [x] API auth flow test registers, logs in, refreshes, and logs out.
- [x] Login page smoke test renders heading.
- [x] Register page smoke test renders heading.

## Status
Implemented:
- [x] apps/api/src/app.ts
- [x] apps/api/src/modules/auth/http/routes.test.ts
- [x] apps/api/vitest.config.ts
- [x] apps/web/src/app/auth/login/page.test.tsx
- [x] apps/web/src/app/auth/register/page.test.tsx
- [x] apps/web/vitest.config.ts
- [x] apps/web/vitest.setup.ts
