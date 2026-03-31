# Day 46 Implementation

Goal: add video upload provider integration and file validation.

## API

- Added `/api/v1/videos/upload-url` to request upload URLs.
- Validates content type and size limits.

## UI

- Added upload URL generator in course edit.

## Verification Checklist

- [x] Upload URL endpoint returns mock URL + expiry.
- [x] Upload requests reject unsupported file types or sizes.

## Status
Implemented:
- [x] apps/api/src/modules/videos/http/routes.ts
- [x] apps/api/src/modules/videos/http/validation.ts
- [x] apps/web/src/app/courses/[courseId]/edit/page.tsx
