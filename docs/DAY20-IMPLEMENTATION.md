# Day 20 Implementation

Goal: create auth UI (login/register) and connect to backend API.

## Auth UI

- Added `/auth/login` and `/auth/register` pages.
- Client-only forms call the API and display feedback.

## API Connection

- Uses `NEXT_PUBLIC_API_BASE_URL` for API calls.
- Saves access and refresh tokens to `localStorage` on login.

## Verification Checklist

- [x] Login form calls `POST /api/v1/auth/login`
- [x] Register form calls `POST /api/v1/auth/register`
- [x] Tokens stored after login

## Status
Implemented:
- [x] apps/web/src/app/auth/login/page.tsx
- [x] apps/web/src/app/auth/register/page.tsx
- [x] apps/web/src/shared/api.ts
