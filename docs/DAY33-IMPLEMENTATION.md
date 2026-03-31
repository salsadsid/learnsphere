# Day 33 Implementation

Goal: create module and lesson models and add nested create endpoints.

## Domain + Infra

- Added `CourseModule` and `Lesson` models.
- Stored modules and lessons in memory.

## API

- Added `POST /api/v1/courses/:courseId/modules`.
- Added `POST /api/v1/courses/:courseId/modules/:moduleId/lessons`.

## Verification Checklist

- [x] Module creation validates required fields.
- [x] Lesson creation validates module ownership.
- [x] Responses return created records.

## Status
Implemented:
- [x] apps/api/src/modules/courses/domain/types.ts
- [x] apps/api/src/modules/courses/infra/course-store.ts
- [x] apps/api/src/modules/courses/use-cases/create-module.ts
- [x] apps/api/src/modules/courses/use-cases/create-lesson.ts
- [x] apps/api/src/modules/courses/http/routes.ts
- [x] apps/api/src/modules/courses/http/validation.ts
- [x] apps/api/src/modules/courses/http/dto.ts
