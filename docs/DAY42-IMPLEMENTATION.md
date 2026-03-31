# Day 42 Implementation

Goal: build student catalog view with category filters.

## UI

- Added category filter to the courses catalog.
- Catalog defaults to published courses.

## API

- Added course categories endpoint to populate filters.

## Verification Checklist

- [x] Categories render in the filter dropdown.
- [x] Search + category filters update the catalog.

## Status
Implemented:
- [x] apps/web/src/app/courses/page.tsx
- [x] apps/api/src/modules/courses/http/routes.ts
- [x] apps/api/src/modules/courses/http/service.ts
- [x] apps/api/src/modules/courses/infra/course-store.ts
