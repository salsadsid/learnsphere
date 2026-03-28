# Day 10 Learning Notes

## Why this implementation is needed
- A route map aligns frontend and backend before implementation.
- Versioning prevents breaking changes for clients.
- Clear resource boundaries reduce API drift.

## Advantages
- Faster endpoint planning and ownership clarity.
- Easier to document and test API behavior.
- Smooth future migrations with versioned URLs.

## Disadvantages
- Adds URL complexity early.
- Requires discipline to keep routes updated.
- Versioning can proliferate if unmanaged.

## Alternatives and tradeoffs
- Use header-based versioning instead of path prefix.
- Start unversioned and add versioning later.
- Use API gateway routing for versioning.

## Concepts and terms
- Versioned API: URL or header includes a version identifier.
- Resource: a noun-based domain object exposed in the API.
- Route map: the planned set of endpoints and actions.

## Fundamentals
- Keep routes consistent and predictable.
- Versioning should be explicit and documented.
- Prefer nouns for resources and verbs for actions.
