# Day 33 Learning Notes

## Why this implementation is needed
- Courses need structured modules and lessons.
- Nested creation enables instructor workflows.
- Models must reflect the learning hierarchy.

## Advantages
- Clear separation of course, module, lesson.
- Ordering enables structured paths.
- Validation prevents orphaned lessons.

## Disadvantages
- In-memory storage is not durable.
- No editing yet for modules or lessons.
- Additional complexity in payloads.

## Alternatives and tradeoffs
- Use a single "content" list instead of modules.
- Defer lesson creation until editing UI exists.
- Enforce strict ordering on the client.

## Concepts and terms
- Module: a grouping of lessons.
- Lesson: individual unit of learning.
- Hierarchy: nested content relationships.

## Fundamentals
- Always verify course + module linkage.
- Keep ordering deterministic.
- Return clear creation responses.
