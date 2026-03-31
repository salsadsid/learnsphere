# Day 87 Learning Notes

## Why this implementation is needed
- Load testing validates latency targets under realistic traffic.

## Advantages
- Early baselines prevent silent regressions.
- Low-cost tests highlight hot spots quickly.

## Disadvantages
- Lite tests may miss peak bottlenecks.
- Results vary across environments.

## Alternatives and tradeoffs
- Use k6 or Artillery (more detailed, more setup).
- Run full-scale load tests in staging (costly but realistic).

## Concepts and terms
- Concurrency: simultaneous in-flight requests.
- Baseline: reference metrics for future comparisons.

## Fundamentals
- Track p50/p95 and error rate for every critical endpoint.
