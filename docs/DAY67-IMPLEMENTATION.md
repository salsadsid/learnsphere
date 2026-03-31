# Day 67 Implementation

Goal: handle double-pay edge cases and add manual retry.

## API

- Checkout reuses paid or pending sessions to prevent double pay.
- Failed payments allow a new checkout with a fresh idempotency key.

## UI

- Checkout button shows "Retry" when status is failed.

## Verification Checklist

- [x] Paid payments skip new checkout creation.
- [x] Failed payments allow retry.

## Status
Implemented:
- [x] apps/api/src/modules/payments/http/service.ts
- [x] apps/web/src/app/courses/[courseId]/page.tsx
