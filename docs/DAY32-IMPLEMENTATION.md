# Day 32 Implementation

Goal: build course details endpoint and UI.

## API

- Added `GET /api/v1/courses/:courseId` for detail payloads.
- Includes modules and lessons in the response.

## UI

- Added `/courses/[courseId]` detail page.
- Renders modules and lessons in order.

## Verification Checklist

- [x] Detail endpoint returns course + modules.
- [x] Detail page handles loading and errors.
- [x] Module/lesson lists render in order.

## Status
Implemented:
- [x] apps/api/src/modules/courses/http/routes.ts
- [x] apps/api/src/modules/courses/use-cases/get-course-detail.ts
- [x] apps/api/src/modules/courses/infra/course-store.ts
- [x] apps/web/src/app/courses/[courseId]/page.tsx
