# Payments Module Boundaries

## Domain
- Payment records and webhook events.

## Infra
- In-memory payment store with idempotency tracking.

## HTTP
- DTOs, validation, and routing.

## API Endpoints
- `GET /api/v1/payments/status/:courseId`
  - Auth: required
  - Response: `PaymentStatusResponseDto`
- `GET /api/v1/payments/history`
  - Auth: required
  - Response: `PaymentHistoryResponseDto`
- `POST /api/v1/payments/checkout`
  - Auth: required
  - Header: `x-idempotency-key`
  - Body: `CreateCheckoutRequestDto`
  - Response: `CreateCheckoutResponseDto`
- `POST /api/v1/payments/webhook`
  - Auth: none (provider only)
  - Header: `x-signature`
  - Body: `PaymentWebhookRequestDto`
  - Response: `PaymentWebhookResponseDto`

## DTOs
- `CreateCheckoutRequestDto`
- `CreateCheckoutResponseDto`
- `PaymentStatusResponseDto`
- `PaymentHistoryResponseDto`
- `PaymentWebhookRequestDto`
- `PaymentWebhookResponseDto`
