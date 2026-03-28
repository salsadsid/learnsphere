# Day 10 Implementation

Goal: draft API routes map (auth, courses, enrollment, progress) and add API versioning decision (v1).

## Versioning Decision

- API base path: `/api/v1`
- All routes below assume the `/api/v1` prefix.

## Routes Map

### Auth
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/logout
- GET /api/v1/auth/me

### Courses
- GET /api/v1/courses
- POST /api/v1/courses
- GET /api/v1/courses/:courseId
- PATCH /api/v1/courses/:courseId
- DELETE /api/v1/courses/:courseId

### Modules
- GET /api/v1/courses/:courseId/modules
- POST /api/v1/courses/:courseId/modules
- PATCH /api/v1/modules/:moduleId
- DELETE /api/v1/modules/:moduleId

### Lessons
- GET /api/v1/modules/:moduleId/lessons
- POST /api/v1/modules/:moduleId/lessons
- PATCH /api/v1/lessons/:lessonId
- DELETE /api/v1/lessons/:lessonId

### Enrollment
- POST /api/v1/enrollments
- GET /api/v1/enrollments
- GET /api/v1/enrollments/:enrollmentId
- PATCH /api/v1/enrollments/:enrollmentId

### Progress
- GET /api/v1/progress/:lessonId
- PUT /api/v1/progress/:lessonId

## Notes

- Use `PATCH` for partial updates.
- `GET /auth/me` returns the current session profile.

## Verification Checklist

- [x] Versioning decision documented
- [x] Routes map drafted

## Status
Implemented:
- [x] docs/DAY10-IMPLEMENTATION.md
