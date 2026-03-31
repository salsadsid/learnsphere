# Notifications Module Boundaries

## Domain
- Notification job metadata and queue lifecycle.

## Infra
- In-memory queue with retry and dead-letter handling.
- Queue connection stub (pre-BullMQ).

## Queue Contracts
- Job types: `enrollment.email`, `course.update`
- Retry policy: 3 attempts, then dead-letter.
- Metrics: queued, processed, failed, retried, dead-lettered.

## Producer Helpers
- `enqueueEnrollmentEmail`
- `enqueueCourseUpdateEmail`

## Operations
- `processNotificationQueue`
- `getNotificationQueueMetrics`
