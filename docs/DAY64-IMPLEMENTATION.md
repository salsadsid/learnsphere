# Day 64 Implementation

Goal: add webhook endpoint and validate webhook signatures.

## API

- Added webhook endpoint in payments module.
- Signature verification via HMAC secret.

## Verification Checklist

- [x] Invalid signature rejected.
- [x] Valid webhook updates payment status.

## Status
Implemented:
- [x] apps/api/src/modules/payments/http/routes.ts
- [x] apps/api/src/modules/payments/http/service.ts
