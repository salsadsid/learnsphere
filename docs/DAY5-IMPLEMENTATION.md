# Day 5 Implementation

Goal: draft error handling conventions and add a centralized error helper (problem+json).

## Error Handling Conventions (problem+json)

- Content-Type: `application/problem+json`
- Required fields: `type`, `title`, `status`
- Optional fields: `detail`, `instance`, `errors`
- Use `about:blank` for generic errors or a status URL (e.g., https://httpstatuses.com/404)

## Centralized Error Helper

- Added `AppError` for consistent error creation
- Added `errorHandler` middleware to serialize `ProblemDetails`
- Added `notFoundHandler` for 404s

## Verification Checklist

- [x] Problem+json shape documented
- [x] Error helper created
- [x] Central error middleware added
- [x] 404 handler added

## Status
Implemented:
- [x] apps/api/src/shared/errors.ts
- [x] apps/api/src/index.ts
