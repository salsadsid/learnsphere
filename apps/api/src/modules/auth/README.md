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
