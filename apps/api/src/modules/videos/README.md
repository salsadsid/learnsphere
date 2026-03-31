# Videos Module Boundaries

## HTTP
- DTOs, validation, and routing for video uploads.

## API Endpoints
- `POST /api/v1/videos/upload-url`
  - Auth: instructor/admin
  - Body: `VideoUploadRequestDto`
  - Response: `VideoUploadResponseDto`

## DTOs
- `VideoUploadRequestDto`
- `VideoUploadResponseDto`
