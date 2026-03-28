# Day 21 Implementation

Goal: add frontend auth guards and refresh-aware API calls.

## Frontend Auth Guard

- Added a client-side guard to check `/api/v1/auth/me`.
- Redirects to `/auth/login` when unauthenticated.
- Added a protected dashboard route for validation.

## Token Refresh Handling

- Added token storage helpers for access/refresh tokens.
- Auth-aware API helpers refresh the token once on 401.
- Tokens are cleared if refresh fails.

## Verification Checklist

- [x] Protected route redirects to login when no session is present.
- [x] Authenticated requests attach the access token.
- [x] Token refresh triggers on 401 and retries once.

## Status
Implemented:
- [x] apps/web/src/shared/auth-storage.ts
- [x] apps/web/src/shared/auth-guard.tsx
- [x] apps/web/src/shared/api.ts
- [x] apps/web/src/shared/auth-session.tsx
- [x] apps/web/src/app/dashboard/page.tsx
