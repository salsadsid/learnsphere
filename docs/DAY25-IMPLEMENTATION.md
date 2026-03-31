# Day 25 Implementation

Goal: add a user profile endpoint and UI.

## API

- Added `/api/v1/auth/profile` with auth guard.
- Response matches profile DTO.

## UI

- Added `/profile` page that loads profile data.
- Reuses the client auth guard.

## Verification Checklist

- [x] Profile endpoint returns user metadata.
- [x] Profile page loads and renders account details.

## Status
Implemented:
- [x] apps/api/src/modules/auth/http/handlers.ts
- [x] apps/api/src/modules/auth/http/routes.ts
- [x] apps/api/src/modules/auth/http/dto.ts
- [x] apps/web/src/app/profile/page.tsx
