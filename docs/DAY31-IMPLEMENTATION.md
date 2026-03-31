# Day 31 Implementation

Goal: build course list UI and connect to list endpoint.

## UI

- Added `/courses` page for the catalog.
- Loads data from `GET /api/v1/courses`.

## Verification Checklist

- [x] Courses page renders list state.
- [x] Empty state renders when no courses exist.
- [x] Cards link to course detail routes.

## Status
Implemented:
- [x] apps/web/src/app/courses/page.tsx
- [x] apps/web/src/app/layout.tsx
