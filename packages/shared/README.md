# Shared Contracts (Draft)

## Data Model Outline
- User: id, email, passwordHash, role, createdAt
- Course: id, title, description, instructorId, createdAt
- Module: id, courseId, title, order
- Lesson: id, moduleId, title, videoUrl, order
- Enrollment: id, userId, courseId, status, createdAt
- Progress: id, userId, lessonId, currentTime, completed, updatedAt

## API Contract Outline
- POST /auth/register
- POST /auth/login
- GET /courses
- GET /courses/:id
- POST /courses
- POST /enrollments
- GET /progress/:lessonId
- PUT /progress/:lessonId
