# Day 34 Implementation

Goal: implement nested data retrieval and optimize detail payload.

## API

- Detail endpoint now returns modules with lessons.
- Payload includes lesson counts per module.

## Verification Checklist

- [x] Modules include ordered lessons.
- [x] Lesson counts match list length.
- [x] Detail payload shape matches DTO.

## Status
Implemented:
- [x] apps/api/src/modules/courses/use-cases/get-course-detail.ts
- [x] apps/api/src/modules/courses/http/routes.ts
- [x] apps/api/src/modules/courses/http/dto.ts
- [x] apps/api/src/modules/courses/infra/course-store.ts
