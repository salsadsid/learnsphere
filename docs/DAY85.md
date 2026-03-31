# Day 85 Learning Notes

## Why this implementation is needed
- Over-fetching slows dashboards and increases backend load.

## Advantages
- Fewer requests and faster load times.
- Cached reads reduce repeated aggregation work.

## Disadvantages
- Cached data can be briefly stale.
- Cache invalidation adds complexity.

## Alternatives and tradeoffs
- Client-side caching only (fast UI, still heavy backend).
- Full query caching with Redis (stronger but more setup).

## Concepts and terms
- Over-fetching: redundant or unnecessary requests.
- TTL cache: time-based expiration.

## Fundamentals
- Combine request consolidation with caching to improve perceived performance.
