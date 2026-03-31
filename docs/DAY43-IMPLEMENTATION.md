# Day 43 Implementation

Goal: implement course ownership checks and enforce instructor-only edits.

## API

- Added ownership checks for course updates, publish/unpublish, modules, and lessons.
- Admins bypass ownership checks.

## Verification Checklist

- [x] Non-owners receive 403 for edit actions.
- [x] Admin users can manage any course.

## Status
Implemented:
- [x] apps/api/src/modules/courses/http/routes.ts
