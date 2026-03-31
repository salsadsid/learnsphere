# Day 30 Implementation

Goal: add a course list endpoint with pagination and filtering.

## API

- Added `GET /api/v1/courses` with query validation.
- Returns paginated list metadata.

## Verification Checklist

- [x] Pagination defaults are enforced.
- [x] Filters narrow results by query parameters.

## Status
Implemented:
- [x] apps/api/src/modules/courses/http/routes.ts
- [x] apps/api/src/modules/courses/http/validation.ts
- [x] apps/api/src/modules/courses/infra/course-store.ts
- [x] apps/api/src/modules/courses/http/dto.ts
