# Day 43 Learning Notes

## Why this implementation is needed
- Instructors must only edit their own courses.
- Ownership checks prevent cross-account edits.
- Admins need a support override.

## Advantages
- Clear authorization boundary for edits.
- Safer instructor workflows.
- Easier to audit permissions later.

## Disadvantages
- Requires owner checks on every mutation.
- Slightly more API complexity.

## Alternatives and tradeoffs
- Use middleware-level ownership checks.
- Enforce ownership in a database layer.

## Concepts and terms
- Ownership: the instructor who created a course.
- Authorization: verifying permission to mutate.

## Fundamentals
- Always check ownership on mutations.
- Return 403 for unauthorized edits.
