# Courses Module Boundaries

## Domain
- Course entities and core types.
- No HTTP or storage concerns.

## Use-cases
- Application workflows for courses.
- Coordinates domain rules and infrastructure.

## Infra
- In-memory course store for now.
- Will be replaced by persistence later.

## HTTP
- DTOs, validation, and routing.
- Handles pagination and filtering.

## API Endpoints
- `POST /api/v1/courses`
  - Auth: instructor/admin
  - Body: `CreateCourseRequestDto`
  - Response: `CourseResponseDto`
- `GET /api/v1/courses`
  - Query: `page`, `pageSize`, `q`, `category`, `instructorId`, `status`
  - Response: `ListCoursesResponseDto`
- `GET /api/v1/courses/categories`
  - Query: `status`
  - Response: `CourseCategoriesResponseDto`
- `GET /api/v1/courses/:courseId`
  - Response: `CourseDetailResponseDto`
- `GET /api/v1/courses/instructor/summary`
  - Auth: instructor/admin
  - Response: `InstructorSummaryResponseDto`
- `GET /api/v1/courses/instructor/courses`
  - Auth: instructor/admin
  - Query: `page`, `pageSize`, `q`, `category`, `status`
  - Response: `ListCoursesResponseDto`
- `PATCH /api/v1/courses/:courseId`
  - Auth: instructor/admin
  - Body: `UpdateCourseRequestDto`
  - Response: `CourseResponseDto`
- `POST /api/v1/courses/:courseId/publish`
  - Auth: instructor/admin
  - Response: `CourseResponseDto`
- `POST /api/v1/courses/:courseId/unpublish`
  - Auth: instructor/admin
  - Response: `CourseResponseDto`
- `POST /api/v1/courses/:courseId/modules`
  - Auth: instructor/admin
  - Body: `CreateModuleRequestDto`
  - Response: `ModuleResponseDto`
- `POST /api/v1/courses/:courseId/modules/:moduleId/lessons`
  - Auth: instructor/admin
  - Body: `CreateLessonRequestDto`
  - Response: `LessonResponseDto`

## DTOs
- `CreateCourseRequestDto`
- `CourseResponseDto`
- `CourseDetailResponseDto`
- `CourseCategoriesResponseDto`
- `CreateModuleRequestDto`
- `CreateLessonRequestDto`
- `InstructorSummaryResponseDto`
- `ListCoursesResponseDto`
- `LessonResponseDto`
- `ModuleResponseDto`
- `UpdateCourseRequestDto`
