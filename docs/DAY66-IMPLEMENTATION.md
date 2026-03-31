# Day 66 Implementation

Goal: add payment status model and show status in the UI.

## API

- Added payment status endpoint per course.
- Status surfaces latest payment state (pending/paid/failed).

## UI

- Course detail shows payment status and disables checkout when pending/paid.

## Verification Checklist

- [x] Payment status endpoint returns status data.
- [x] Course detail UI displays payment status.

## Status
Implemented:
- [x] apps/api/src/modules/payments/http/routes.ts
- [x] apps/api/src/modules/payments/http/service.ts
- [x] apps/web/src/app/courses/[courseId]/page.tsx
