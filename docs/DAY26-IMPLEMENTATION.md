# Day 26 Implementation

Goal: add logout + token revoke endpoint and clear client auth state.

## API

- Added `/api/v1/auth/revoke` for refresh token revocation.
- Logout continues to revoke refresh tokens.

## UI

- Sign out now calls the logout endpoint before clearing local tokens.

## Verification Checklist

- [x] Logout clears refresh tokens on the server.
- [x] Revoke endpoint returns 204.
- [x] Client clears local tokens after logout.

## Status
Implemented:
- [x] apps/api/src/modules/auth/http/handlers.ts
- [x] apps/api/src/modules/auth/http/routes.ts
- [x] apps/web/src/shared/auth-session.tsx
