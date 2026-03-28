# Day 13 Learning Notes

## Why this implementation is needed
- Health checks confirm the service is alive.
- Readiness checks tell deploy systems when the app can receive traffic.
- Uptime provides a quick signal of stability.

## Advantages
- Simple signals for monitoring and orchestration.
- Easy to extend when dependencies are added.
- Lightweight without new dependencies.

## Disadvantages
- Readiness is optimistic without real dependency checks.
- Uptime alone does not indicate correctness.
- Risk of false positives if deeper checks are needed.

## Alternatives and tradeoffs
- Add dependency checks (db, cache) to readiness.
- Use separate liveness and readiness ports.
- Emit richer status with version/build info.

## Concepts and terms
- Liveness: is the process running.
- Readiness: can the service handle traffic.
- Uptime: seconds since start.

## Fundamentals
- Keep health endpoints fast and side-effect free.
- Avoid leaking sensitive system data.
- Make readiness stricter as dependencies grow.
