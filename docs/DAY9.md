# Day 9 Learning Notes

## Why this implementation is needed
- Content hierarchy affects performance, scalability, and API design.
- Early modeling decisions reduce refactors once data exists.
- Explicit tradeoffs keep the team aligned on constraints.

## Advantages
- Scales well with large courses and many lessons.
- Fine-grained updates for modules and lessons.
- Flexible loading patterns for the UI.

## Disadvantages
- More queries to assemble full course detail.
- Ordering logic must be enforced consistently.
- Requires care with cascading deletes and integrity.

## Alternatives and tradeoffs
- Embed modules/lessons inside course for simpler reads.
- Hybrid: embed modules, reference lessons.
- Precompute a read model for full course trees.

## Concepts and terms
- Embedded model: child documents stored inside parent.
- Referenced model: child documents stored separately with IDs.
- Read model: optimized view for common query patterns.

## Fundamentals
- Model for the dominant query patterns first.
- Keep write paths explicit and safe.
- Document tradeoffs to guide future changes.
