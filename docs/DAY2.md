# Day 2 Learning Notes

## Why this implementation is needed
- A dev script provides a reliable, repeatable way to run the backend and frontend locally.
- A health endpoint offers a fast smoke test to confirm the API is running and reachable.
- Verifying both servers early prevents integration surprises later.

## Advantages
- Faster feedback loop: changes are validated immediately in dev mode.
- Clear baseline: teams can agree on the same commands and expected output.
- Health checks enable simple monitoring and future readiness probes.

## Disadvantages
- dev servers can hide production issues (different runtime flags, no build step).
- nodemon + ts-node can be slower on large codebases.
- a public health endpoint may expose minimal service info if not protected.

## Alternatives and tradeoffs
- Use `tsx` or `ts-node-dev` instead of `ts-node` for faster reloads.
- Add a `/ready` endpoint to verify downstream dependencies (database, cache).
- Use `npm --prefix <path> run dev` or a monorepo task runner (e.g., turbo) to standardize commands.

## Concepts and terms
- Dev server: a local server with hot reload for quick iteration.
- Health endpoint: a lightweight endpoint that confirms the service is alive.
- Smoke test: a minimal check that critical paths are working.

## Fundamentals
- Local dev workflow reduces risk by verifying assumptions early.
- Small, reliable checks are the foundation for observability and uptime.
- Consistent scripts improve collaboration and onboarding speed.
