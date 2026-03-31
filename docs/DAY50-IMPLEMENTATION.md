# Day 50 Implementation

Goal: handle multi-device conflicts and decide resolution rules.

## API

- Uses latest `clientUpdatedAt` to resolve conflicts.
- Older updates are rejected as stale.

## UI

- Client displays server-preferred progress when newer.

## Verification Checklist

- [x] Stale updates do not overwrite newer progress.
- [x] Response indicates acceptance status.

## Status
Implemented:
- [x] apps/api/src/modules/progress/infra/progress-store.ts
- [x] apps/api/src/modules/progress/http/routes.ts
- [x] apps/web/src/app/courses/[courseId]/watch/page.tsx
