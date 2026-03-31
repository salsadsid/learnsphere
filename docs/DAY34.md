# Day 34 Learning Notes

## Why this implementation is needed
- Detail pages need the full course outline.
- Nested retrieval reduces client round trips.
- Payload shaping keeps UI lean.

## Advantages
- Single response for course overview.
- Ordered data supports clear rendering.
- Lesson counts speed up UI summaries.

## Disadvantages
- Larger response payloads.
- Future pagination within modules may be needed.
- In-memory store limits scale testing.

## Alternatives and tradeoffs
- Add separate endpoints for lessons.
- Use cursor pagination per module.
- Expand payload only on demand.

## Concepts and terms
- Data shaping: structuring API output for UI.
- Outline payload: modules with lessons.
- Aggregates: lesson counts per module.

## Fundamentals
- Keep API response consistent across calls.
- Preserve ordering in nested data.
- Validate payload sizes as content grows.
