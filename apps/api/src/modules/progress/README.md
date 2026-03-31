# Progress Module Boundaries

## Domain
- Progress records for video playback.

## Infra
- In-memory progress store.

## HTTP
- DTOs, validation, and routing.

## API Endpoints
- `GET /api/v1/progress/:videoId`
  - Auth: required
  - Response: `ProgressResponseDto`
- `POST /api/v1/progress`
  - Auth: required
  - Body: `SaveProgressRequestDto`
  - Response: `SaveProgressResponseDto`
- `POST /api/v1/progress/completions`
  - Auth: required
  - Body: `MarkLessonCompleteRequestDto`
  - Response: `LessonCompletionResponseDto`
- `GET /api/v1/progress/completions/:courseId`
  - Auth: required
  - Response: `LessonCompletionResponseDto[]`
- `GET /api/v1/progress/course/:courseId`
  - Auth: required
  - Response: `CourseProgressResponseDto`
- `POST /api/v1/progress/snapshots`
  - Auth: required
  - Body: `WatchSnapshotRequestDto`
  - Response: `WatchSnapshotResponseDto`
- `POST /api/v1/progress/events`
  - Auth: required
  - Body: `VideoEventRequestDto`
  - Response: `VideoEventResponseDto`
- `GET /api/v1/progress/instructor/course/:courseId`
  - Auth: instructor/admin
  - Response: `InstructorCourseProgressResponseDto`
- `GET /api/v1/progress/instructor/course/:courseId/export`
  - Auth: instructor/admin
  - Response: CSV export

## DTOs
- `ProgressResponseDto`
- `SaveProgressRequestDto`
- `SaveProgressResponseDto`
- `MarkLessonCompleteRequestDto`
- `LessonCompletionResponseDto`
- `CourseProgressResponseDto`
- `WatchSnapshotRequestDto`
- `WatchSnapshotResponseDto`
- `VideoEventRequestDto`
- `VideoEventResponseDto`
- `InstructorCourseProgressResponseDto`
