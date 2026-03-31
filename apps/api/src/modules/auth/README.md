# Auth Module Boundaries

## Domain
- Core auth entities and rules.
- No HTTP, database, or framework dependencies.

## Use-cases
- Application workflows like register and login.
- Orchestrates domain rules and infra dependencies via interfaces.

## Infra
- Database models and external service adapters.
- Implements interfaces defined inward.

## HTTP
- Request/response DTOs and validation.
- Controllers and routing glue.

## Dependency Rules
- HTTP -> Use-cases -> Domain
- Infra -> Use-cases via interfaces
- Domain never depends on outer layers

## API Endpoints
- `POST /api/v1/auth/register`
	- Body: `RegisterRequestDto`
	- Response: `RegisterResponseDto`
- `POST /api/v1/auth/login`
	- Body: `LoginRequestDto`
	- Response: `LoginResponseDto`
- `POST /api/v1/auth/refresh`
	- Body: `{ refreshToken: string }`
	- Response: `RefreshResponseDto`
- `POST /api/v1/auth/logout`
	- Body: `{ refreshToken: string }`
	- Response: `204 No Content`
- `POST /api/v1/auth/revoke`
	- Body: `{ refreshToken: string }`
	- Response: `204 No Content`
- `GET /api/v1/auth/me`
	- Header: `Authorization: Bearer <accessToken>`
	- Response: `MeResponseDto`
- `GET /api/v1/auth/profile`
	- Header: `Authorization: Bearer <accessToken>`
	- Response: `ProfileResponseDto`

## DTOs
- `RegisterRequestDto`, `RegisterResponseDto`
- `LoginRequestDto`, `LoginResponseDto`
- `RefreshResponseDto`
- `MeResponseDto`
- `ProfileResponseDto`
