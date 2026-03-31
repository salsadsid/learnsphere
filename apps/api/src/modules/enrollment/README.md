# Enrollment Module Boundaries

## Domain
- Enrollment records (user + course).

## Infra
- In-memory enrollment store.

## HTTP
- DTOs, validation, and routing.

## API Endpoints
- `GET /api/v1/enrollments`
  - Auth: required
  - Response: `EnrollmentListResponseDto`
- `GET /api/v1/enrollments/:courseId`
  - Auth: required
  - Response: `EnrollmentStatusResponseDto`
- `POST /api/v1/enrollments`
  - Auth: required
  - Body: `EnrollRequestDto`
  - Response: `EnrollmentResponseDto`

## DTOs
- `EnrollmentResponseDto`
- `EnrollmentStatusResponseDto`
- `EnrollmentListResponseDto`
- `EnrollRequestDto`
