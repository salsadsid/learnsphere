# Day 15 Implementation

Goal: implement register endpoint with password hashing and validation.

## Register Endpoint

- Route: `POST /api/v1/auth/register`
- Validates input using Zod schema.
- Hashes password with bcryptjs (10 rounds).
- Returns `RegisterResponseDto`.

## In-Memory Store (Temporary)

- Added an in-memory user store for local development.
- Rejects duplicate emails with a 409 response.

## Verification Checklist

- [x] Register route created
- [x] Password hashing implemented
- [x] Duplicate email handled

## Status
Implemented:
- [x] apps/api/src/modules/auth/http/routes.ts
- [x] apps/api/src/modules/auth/use-cases/register-user.ts
- [x] apps/api/src/modules/auth/infra/user-store.ts
- [x] apps/api/src/index.ts
- [x] apps/api/package.json
