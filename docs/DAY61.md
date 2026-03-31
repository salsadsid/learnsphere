# Day 61 Learning Notes

## Why this implementation is needed
- Enrollments connect learners to course access.

## Advantages
- Simple, idempotent enrollment flow.

## Disadvantages
- In-memory only (no persistence yet).

## Alternatives and tradeoffs
- Store enrollments in a database for persistence.

## Concepts and terms
- Enrollment record: ties user to a course.

## Fundamentals
- Enforce uniqueness to avoid duplicates.
