# Day 62 Implementation

Goal: add access control for enrolled users and UI gating on course pages.

## API

- Progress endpoints enforce enrollment-based access checks.

## UI

- Course detail and watch pages gate lessons when not enrolled.
- Enrollment CTA added for quick access.

## Verification Checklist

- [x] Access checks block non-enrolled users.
- [x] Course pages show gating UI.

## Status
Implemented:
- [x] apps/api/src/modules/progress/http/routes.ts
- [x] apps/web/src/app/courses/[courseId]/page.tsx
- [x] apps/web/src/app/courses/[courseId]/watch/page.tsx
