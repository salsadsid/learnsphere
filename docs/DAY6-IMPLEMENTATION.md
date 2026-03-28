# Day 6 Implementation

Goal: draft environment config strategy and add a config loader in the backend.

## Environment Config Strategy

- Each app has its own `.env.example` as a template.
- Only non-secret defaults are documented.
- Backend config loads from environment with safe fallbacks.

## Backend Config Loader

- Added a shared config module to load and parse environment variables.
- Centralized default values for predictable local runs.

## Verification Checklist

- [x] apps/api/.env.example updated
- [x] apps/web/.env.example created
- [x] Backend config loader added
- [x] API entry uses config loader

## Status
Implemented:
- [x] apps/api/src/shared/config.ts
- [x] apps/api/src/index.ts
- [x] apps/web/.env.example
