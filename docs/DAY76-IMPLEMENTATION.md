# Day 76 Implementation

Goal: send notifications on enrollment and course updates.

## Notifications

- Enrollment creation queues an email job.
- Course updates queue notifications for enrolled learners.

## Verification Checklist

- [x] Enrollment job queued on new enrollment.
- [x] Course update job queued for each enrollee.

## Status
Implemented:
- [x] apps/api/src/modules/enrollment/http/service.ts
- [x] apps/api/src/modules/courses/http/service.ts
- [x] apps/api/src/modules/notifications/infra/notification-queue.ts
