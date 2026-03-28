# Day 7 Implementation

Goal: create a shared types package and add basic lint/format scripts.

## Shared Types Package

- Added `packages/shared/src/index.ts` with core domain types.
- Standardized ID and timestamp aliases for consistent contracts.

## Lint and Format Scripts

- Added `lint` and `format` scripts to API, web, and shared packages.
- Added Prettier as a dev dependency where needed.

## Verification Checklist

- [x] Shared types package exports core models
- [x] Shared package build config set to `src` -> `dist`
- [x] Lint scripts added
- [x] Format scripts added

## Status
Implemented:
- [x] packages/shared/src/index.ts
- [x] packages/shared/package.json
- [x] packages/shared/tsconfig.json
- [x] apps/api/package.json
- [x] apps/web/package.json
