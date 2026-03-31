# Day 29 Implementation

Goal: create the course model and course creation endpoint.

## Course Model

- Added core course domain types.
- Added in-memory course store.

## API

- Added `POST /api/v1/courses` for instructors/admins.
- Validates input and returns a course DTO.

## Verification Checklist

- [x] Course creation validates required fields.
- [x] Created courses include ownership metadata.

## Status
Implemented:
- [x] apps/api/src/modules/courses/domain/types.ts
- [x] apps/api/src/modules/courses/infra/course-store.ts
- [x] apps/api/src/modules/courses/use-cases/create-course.ts
- [x] apps/api/src/modules/courses/http/validation.ts
- [x] apps/api/src/modules/courses/http/dto.ts
- [x] apps/api/src/modules/courses/http/routes.ts
