# Day 3 Learning Notes

## Why this implementation is needed
- Clear boundaries keep auth logic isolated and prevent cross-layer coupling.
- DTOs provide stable contracts between HTTP handlers and use-cases.
- Validation rules protect business logic from invalid inputs early.

## Advantages
- Easier testing: domain and use-cases can be tested without HTTP or DB.
- Safer changes: DTOs decouple external requests from internal models.
- Better security: validation reduces invalid or unsafe data entering the system.

## Disadvantages
- Extra boilerplate when the project is still small.
- Risk of over-design if boundaries are too strict too early.
- Validation can drift if rules are duplicated across layers.

## Alternatives and tradeoffs
- Use a validation library (Zod/Joi) for stronger schemas and shared types.
- Keep DTOs minimal and evolve as endpoints are implemented.
- Use a single "application DTO" layer instead of HTTP-specific DTOs.

## Concepts and terms
- DTO (Data Transfer Object): a shape used to move data across boundaries.
- Boundary: a seam between layers that limits dependencies.
- Validation rules: checks that ensure data is well-formed and safe to use.

## Fundamentals
- Dependency direction should flow inward (HTTP -> use-cases -> domain).
- Contracts should be stable and explicit to avoid hidden coupling.
- Validation is a first line of defense for reliability and security.
