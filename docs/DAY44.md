# Day 44 Learning Notes

## Why this implementation is needed
- Instructors need safe drafting workflows.
- Autosave prevents accidental data loss.
- Status toggles make drafts explicit.

## Advantages
- Less risk of lost edits.
- Clear feedback on save state.
- Draft workflow supports iteration.

## Disadvantages
- Autosave adds extra API calls.
- Requires careful debouncing.

## Alternatives and tradeoffs
- Add manual save only.
- Use a background save queue.

## Concepts and terms
- Autosave: periodic background save.
- Draft: unpublished version of a course.

## Fundamentals
- Avoid saving empty payloads.
- Show saving feedback in UI.
