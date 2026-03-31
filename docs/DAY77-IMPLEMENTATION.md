# Day 77 Implementation

Goal: add retry logic and dead-letter handling.

## Queue

- Jobs retry up to 3 attempts.
- Failed jobs move to dead-letter queue.

## Verification Checklist

- [x] Failed jobs retry and eventually dead-letter.

## Status
Implemented:
- [x] apps/api/src/modules/notifications/infra/notification-queue.ts
