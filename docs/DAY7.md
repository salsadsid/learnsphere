# Day 7 Learning Notes

## Why this implementation is needed
- Shared types keep contracts consistent across services.
- Linting catches mistakes early in development.
- Formatting reduces noisy diffs and keeps code readable.

## Advantages
- Fewer mismatched DTOs between frontend and backend.
- Faster onboarding with clear, centralized models.
- Consistent code style across packages.

## Disadvantages
- Requires build steps to publish shared types.
- Tight coupling if shared types are changed too frequently.
- Tooling overhead for small prototypes.

## Alternatives and tradeoffs
- Use OpenAPI/Swagger as the source of truth instead of shared TS types.
- Generate types from schemas rather than writing by hand.
- Keep shared types minimal and only expand when needed.

## Concepts and terms
- Shared contracts: reusable types used across packages.
- Linting: static analysis to catch errors and style issues.
- Formatting: automatic code style normalization.

## Fundamentals
- Shared types should be stable and versioned with care.
- Lint/format rules should be consistent and simple.
- Avoid leaking internal-only fields into shared contracts.
