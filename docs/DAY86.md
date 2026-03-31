# Day 86 Learning Notes

## Why this implementation is needed
- Performance diagnostics require consistent latency measurements and targets.

## Advantages
- P95 targets clarify expected API behavior.
- On-request metrics reveal slow routes quickly.

## Disadvantages
- In-memory metrics reset on restart.
- Targets can be misleading without load tests.

## Alternatives and tradeoffs
- Use external APM (richer insights, higher cost).
- Export metrics to Prometheus (more setup).

## Concepts and terms
- p95 latency: 95th percentile response time.
- Latency budget: target duration for responses.

## Fundamentals
- Measure first, optimize second, then validate under load.
