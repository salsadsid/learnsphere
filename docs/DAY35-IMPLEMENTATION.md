# Day 35 Implementation

Goal: add course editing endpoint and build course edit UI.

## API

- Added `PATCH /api/v1/courses/:courseId` for updates.
- Validates at least one field to update.

## UI

- Added `/courses/[courseId]/edit` page.
- Supports editing title, summary, category, level.

## Verification Checklist

- [x] Updates return the refreshed course DTO.
- [x] Edit UI loads current values.
- [x] Save flow reports success.

## Status
Implemented:
- [x] apps/api/src/modules/courses/use-cases/update-course.ts
- [x] apps/api/src/modules/courses/http/routes.ts
- [x] apps/api/src/modules/courses/http/validation.ts
- [x] apps/web/src/app/courses/[courseId]/edit/page.tsx
- [x] apps/web/src/shared/api.ts
