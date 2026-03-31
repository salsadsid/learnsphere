# Day 30 Learning Notes

## Why this implementation is needed
- Users need a way to browse courses.
- Pagination prevents over-fetching.
- Filtering supports discovery and admin views.

## Advantages
- List endpoint supports the catalog UI.
- Query parameters stay simple and explicit.
- Pagination metadata enables UI controls.

## Disadvantages
- In-memory list ordering is limited.
- Filters are basic until real search is added.

## Alternatives and tradeoffs
- Use cursor-based pagination later.
- Add full-text search with a DB index.

## Concepts and terms
- Pagination: slice a large dataset into pages.
- Filtering: narrowing results by query params.
- Query contract: rules for list parameters.

## Fundamentals
- Always return total counts.
- Keep page size limits enforced.
- Validate query params before use.
