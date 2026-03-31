# Day 27 Implementation

Goal: improve auth error states and UI messaging.

## Auth Guard Updates

- Differentiated forbidden vs unauthorized responses.
- Redirects to login include a reason and next path.

## Login UX

- Displays a session-expired or forbidden message.
- Redirects to the intended destination after login.

## Verification Checklist

- [x] Expired session redirects to login with reason.
- [x] Forbidden state shows a clear access message.
- [x] Login redirects to the intended page after success.

## Status
Implemented:
- [x] apps/web/src/shared/auth-guard.tsx
- [x] apps/web/src/app/auth/login/page.tsx
