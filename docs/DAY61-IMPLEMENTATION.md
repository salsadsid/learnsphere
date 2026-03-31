# Day 61 Implementation

Goal: implement enrollment model and endpoints with unique enrollment per user/course.

## API

- Added enrollment module (domain/infra/http).
- Enrollment creation is idempotent per user + course.
- Added enrollment listing and status lookup.

## Verification Checklist

- [x] Unique enrollment enforced in store.
- [x] Enrollment endpoints return status and list data.

## Status
Implemented:
- [x] apps/api/src/modules/enrollment/domain/types.ts
- [x] apps/api/src/modules/enrollment/infra/enrollment-store.ts
- [x] apps/api/src/modules/enrollment/http/routes.ts
