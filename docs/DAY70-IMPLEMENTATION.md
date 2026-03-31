# Day 70 Implementation

Goal: add enrollment confirmation email placeholder and prep for queues.

## Notifications

- Added placeholder notification queue helper.
- Enrollment creation enqueues a confirmation message.
- Payment webhook enqueues when enrollment is created.

## Verification Checklist

- [x] New enrollments trigger queue placeholder.
- [x] Webhook-driven enrollments trigger notifications.

## Status
Implemented:
- [x] apps/api/src/modules/notifications/infra/notification-queue.ts
- [x] apps/api/src/modules/enrollment/http/service.ts
- [x] apps/api/src/modules/payments/http/service.ts
