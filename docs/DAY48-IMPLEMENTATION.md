# Day 48 Implementation

Goal: track video progress locally and add resume UX.

## UI

- Local progress stored per video.
- Resume prompt shown when progress exists.

## Verification Checklist

- [x] Progress stored in localStorage.
- [x] Resume CTA seeks to last position.

## Status
Implemented:
- [x] apps/web/src/shared/video-progress.ts
- [x] apps/web/src/app/courses/[courseId]/watch/page.tsx
