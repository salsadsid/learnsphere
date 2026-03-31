# Day 84 Learning Notes

## Why this implementation is needed
- Aggregations are needed for analytics without expensive per-request scans.

## Advantages
- Map-based aggregations reduce repeated work.
- Cleaner separation between raw events and computed metrics.

## Disadvantages
- Aggregations can still be expensive at scale without indexes.
- Requires careful cache invalidation.

## Alternatives and tradeoffs
- Precompute metrics offline (fast reads, delayed updates).
- Add database-level aggregation pipelines (more complex).

## Concepts and terms
- Aggregation pipeline: staged computation over data.
- Materialized view: stored precomputed metrics.

## Fundamentals
- Choose aggregation strategy based on freshness and scale.
