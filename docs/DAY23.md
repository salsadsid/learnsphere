# Day 23 Learning Notes

## Why this implementation is needed
- Auth flows need quick regression checks.
- Tests catch contract drift early.
- Smoke tests confirm UI renders key entry points.

## Advantages
- API flows are validated end-to-end.
- Frontend pages are verified at render time.
- Faster feedback during refactors.

## Disadvantages
- In-memory stores can make tests order-sensitive.
- Client-side smoke tests do not cover real network calls.
- More tooling to maintain.

## Alternatives and tradeoffs
- Use supertest for API and Playwright for browser flows.
- Mock auth endpoints instead of hitting the real app.
- Move toward integration tests once persistence is added.

## Concepts and terms
- Smoke test: fast check that a screen renders without crashing.
- Integration test: exercise multiple layers with real data.
- Test harness: setup needed to run tests consistently.

## Fundamentals
- Keep tests minimal and stable.
- Prefer one happy-path auth flow test.
- Avoid over-mocking early on.
