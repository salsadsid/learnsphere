# Day 41 Implementation

Goal: build instructor course dashboard and summary stats.

## API

- Added instructor summary endpoint.
- Added instructor course list endpoint.

## UI

- Updated `/dashboard` to show instructor stats and course list.

## Verification Checklist

- [x] Summary metrics render for instructors.
- [x] Course list links to edit view.

## Status
Implemented:
- [x] apps/api/src/modules/courses/http/routes.ts
- [x] apps/api/src/modules/courses/http/service.ts
- [x] apps/api/src/modules/courses/infra/course-store.ts
- [x] apps/web/src/app/dashboard/page.tsx
