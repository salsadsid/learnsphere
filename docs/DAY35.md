# Day 35 Learning Notes

## Why this implementation is needed
- Instructors need to iterate on course details.
- Update flows support content refinement.
- Editing validates permissions and inputs.

## Advantages
- Fast iteration for course metadata.
- Clear UI for updating core fields.
- Server-side validation ensures integrity.

## Disadvantages
- No module/lesson editing yet.
- Auth required for edit access.
- In-memory store loses changes on restart.

## Alternatives and tradeoffs
- Use a full edit wizard later.
- Update through an admin dashboard.
- Store draft changes before publishing.

## Concepts and terms
- Update flow: patching existing records.
- Dirty state: tracking unsaved edits.
- Validation: ensuring change requests are valid.

## Fundamentals
- Require at least one update field.
- Keep edit UI in sync with API responses.
- Provide clear success messaging.
