# Day 24 Learning Notes

## Why this implementation is needed
- Auth flows are growing and need clearer separation.
- Documentation keeps contracts stable across frontend/backend.
- Refactors reduce onboarding time for new contributors.

## Advantages
- HTTP handlers are easier to scan and test.
- DTOs become the single source of truth for responses.
- Clear API docs reduce ambiguity.

## Disadvantages
- Small refactors add churn with little visible feature change.
- Documentation can drift if not maintained.
- Extra files increase navigation overhead.

## Alternatives and tradeoffs
- Keep routes in a single file and rely on comments.
- Use OpenAPI for formal contracts.
- Add a service layer between HTTP and use-cases.

## Concepts and terms
- DTO: data transfer object describing request/response shapes.
- Handler: focused function for a single route.
- Contract: agreed structure for API payloads.

## Fundamentals
- Keep handlers thin and focused.
- Document response shapes where they live.
- Align routes with DTO names.
