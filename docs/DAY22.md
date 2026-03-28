# Day 22 Learning Notes

## Why this implementation is needed
- Auth endpoints are frequent attack targets and need throttling.
- Audit logs provide traceability for security events.
- Early visibility helps catch misuse before persistence arrives.

## Advantages
- Rate limits slow down brute-force attempts.
- Audit entries make user auth activity visible.
- Baseline security posture improves quickly.

## Disadvantages
- In-memory limits reset on restart.
- IP-based throttling can block shared networks.
- Logs are volatile without persistence.

## Alternatives and tradeoffs
- Use Redis-backed rate limiting for multi-instance apps.
- Emit audit logs to a database or observability pipeline.
- Apply adaptive limits per role or per endpoint.

## Concepts and terms
- Rate limiting: restricting request volume over time.
- Audit log: append-only record of security actions.
- Throttling window: time range for counting requests.

## Fundamentals
- Keep limits strict for login/register.
- Log only successful auth actions for now.
- Prefer minimal, predictable error messages.
