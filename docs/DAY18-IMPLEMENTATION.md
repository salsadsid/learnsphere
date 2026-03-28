# Day 18 Implementation

Goal: build auth middleware for API and protect private routes.

## Auth Middleware

- Added `requireAuth` middleware to validate JWT access tokens.
- Attaches authenticated user to the request.

## Protected Route

- Added `GET /api/v1/auth/me` protected by `requireAuth`.

## Verification Checklist

- [x] Auth middleware created
- [x] Protected route added
- [x] Unauthorized access returns 401

## Status
Implemented:
- [x] apps/api/src/modules/auth/http/middleware.ts
- [x] apps/api/src/modules/auth/http/routes.ts
