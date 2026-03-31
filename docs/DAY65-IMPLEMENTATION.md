# Day 65 Implementation

Goal: add idempotency keys and replay protection for webhooks.

## API

- Checkout requires `x-idempotency-key`.
- Webhook event ids are tracked to prevent duplicates.

## Verification Checklist

- [x] Duplicate webhook events are ignored.
- [x] Idempotency returns existing checkout session.

## Status
Implemented:
- [x] apps/api/src/modules/payments/infra/payment-store.ts
- [x] apps/api/src/modules/payments/http/routes.ts
