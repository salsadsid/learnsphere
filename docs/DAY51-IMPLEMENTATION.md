# Day 51 Implementation

Goal: mark lessons as completed and show completion indicators.

## API

- Added lesson completion endpoint in progress module.
- Completion data is stored per user, course, and lesson.

## UI

- Course detail shows completed lessons.
- Watch page can mark a lesson as complete.

## Verification Checklist

- [x] Completion endpoint creates or returns a completion record.
- [x] Course detail renders completion badges.
- [x] Watch page can mark lesson complete.

## Status
Implemented:
- [x] apps/api/src/modules/progress/http/routes.ts
- [x] apps/api/src/modules/progress/infra/progress-store.ts
- [x] apps/web/src/app/courses/[courseId]/page.tsx
- [x] apps/web/src/app/courses/[courseId]/watch/page.tsx
