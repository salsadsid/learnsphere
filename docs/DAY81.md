# Day 81 Learning Notes

## Why this implementation is needed
- Analytics requires standardized event and completion signals to build reliable dashboards.

## Advantages
- Consistent schema enables downstream reporting.
- Completion plus watch time improves engagement insight.

## Disadvantages
- More data to store and aggregate.
- Requires clear naming and retention policies.

## Alternatives and tradeoffs
- Use only completion events (lower fidelity).
- Store raw events and compute metrics offline (higher cost).

## Concepts and terms
- Analytics schema: a shared contract for event data.
- Watch time: time-on-task inferred from snapshots.

## Fundamentals
- Accurate metrics require consistent instrumentation and aggregation logic.
