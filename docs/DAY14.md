# Day 14 Learning Notes

## Retrospective Summary
- The foundation phase delivered stable scaffolding for API and web.
- Shared contracts and validation tooling reduce duplication.
- Early UI shell enables product direction without backend coupling.

## What Went Well
- Clear day-by-day implementation cadence.
- Consistent documentation across days.
- Lean but sufficient tooling for linting, formatting, and logging.

## What Needs Attention
- No persistence layer yet (MongoDB).
- Auth is still a placeholder conceptually.
- Request validation not yet wired to actual route handlers.

## Risks for Phase 2
- Delayed database work may slow auth and course features.
- Without tests, regressions may slip into auth.
- Shared types could drift without usage.

## Next Focus
- Implement register/login, then middleware and role checks.
- Start integrating shared types into API/web boundaries.
- Add minimal API tests alongside auth endpoints.
