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

## DTOs
- `ProgressResponseDto`
- `SaveProgressRequestDto`
- `SaveProgressResponseDto`
