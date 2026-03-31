# Day 29 Learning Notes

## Why this implementation is needed
- Courses are the core product entity.
- A stable schema enables downstream features.
- Creation endpoints unlock instructor workflows.

## Advantages
- Establishes a course data model.
- Enables instructor-owned content creation.
- Provides a base for modules and lessons.

## Disadvantages
- In-memory store resets on restart.
- Minimal schema may need expansion later.

## Alternatives and tradeoffs
- Start with a document DB schema early.
- Use a single course description field only.

## Concepts and terms
- Course schema: normalized structure for course data.
- Owner: instructor responsible for a course.
- Draft status: course not yet published.

## Fundamentals
- Keep creation validation strict.
- Capture ownership metadata.
- Default to draft status.
