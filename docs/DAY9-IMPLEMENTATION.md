# Day 9 Implementation

Goal: decide course/module/lesson modeling (embedded vs referenced) and document tradeoffs.

## Decision

Use referenced collections for `Course`, `Module`, and `Lesson` with ordered lists.

- `Course` stores core metadata.
- `Module` references `courseId` and contains `order` for sequencing.
- `Lesson` references `moduleId` and contains `order` and `videoUrl`.

## Rationale

- Supports large courses without hitting document size limits.
- Allows independent updates to modules/lessons without rewriting the full course.
- Simplifies pagination and selective loading (e.g., load module list only).

## Tradeoffs

- Requires multiple queries or aggregation for full course trees.
- Ordering must be maintained explicitly (`order` fields).
- Slightly more complex for writes and deletes (cascade rules).

## Verification Checklist

- [x] Modeling choice documented
- [x] Tradeoffs captured

## Status
Implemented:
- [x] docs/DAY9-IMPLEMENTATION.md
