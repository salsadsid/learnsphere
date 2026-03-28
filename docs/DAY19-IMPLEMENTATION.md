# Day 19 Implementation

Goal: implement role checks (RBAC) and enforce role checks on course creation.

## Role Checks

- Added `requireRole` middleware to enforce user roles.
- Returns 403 for forbidden access.

## Course Creation Guard

- Protected `POST /api/v1/courses` with `requireAuth` and `requireRole`.
- Allows only `instructor` and `admin` roles.

## Verification Checklist

- [x] Role middleware created
- [x] Course creation guarded
- [x] Forbidden access returns 403

## Status
Implemented:
- [x] apps/api/src/modules/auth/http/roles.ts
- [x] apps/api/src/modules/courses/http/routes.ts
- [x] apps/api/src/index.ts
