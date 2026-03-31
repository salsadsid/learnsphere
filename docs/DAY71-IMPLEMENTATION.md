# Day 71 Implementation

Goal: add invoice history endpoint and billing UI page.

## API

- Added payment history endpoint for authenticated users.
- Returns recent payment attempts with status and timestamps.

## UI

- Added billing page to show payment history.

## Verification Checklist

- [x] Payment history endpoint returns items.
- [x] Billing page renders history list.

## Status
Implemented:
- [x] apps/api/src/modules/payments/http/routes.ts
- [x] apps/api/src/modules/payments/http/service.ts
- [x] apps/web/src/app/billing/page.tsx
