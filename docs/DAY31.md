# Day 31 Learning Notes

## Why this implementation is needed
- Users need a dedicated course catalog page.
- List UI validates the list API payload shape.
- Navigation to detail views starts here.

## Advantages
- Visible entry point for courses.
- Clear empty and loading states.
- Reusable list card pattern for future filtering.

## Disadvantages
- No filters or search UI yet.
- List endpoint is in-memory only.
- No caching or pagination controls.

## Alternatives and tradeoffs
- Render the list on the landing page.
- Use server components for data fetching.
- Defer UI until search is built.

## Concepts and terms
- Catalog page: the list view for courses.
- Empty state: UI for no data.
- List card: summary view for each course.

## Fundamentals
- Keep list UI resilient to missing fields.
- Provide clear navigation to details.
- Surface loading and error states.
