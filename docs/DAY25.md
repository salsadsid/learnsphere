# Day 25 Learning Notes

## Why this implementation is needed
- Users need a place to view their account details.
- Profile data supports future settings and preferences.
- The endpoint validates auth state beyond `/me`.

## Advantages
- Profile page confirms login context.
- Reusable endpoint for other UI surfaces.
- Stronger mental model for user data flow.

## Disadvantages
- Profile data is minimal without persistence.
- More client fetch logic to maintain.
- Duplicate data with `/me` unless unified later.

## Alternatives and tradeoffs
- Reuse `/me` directly instead of a profile endpoint.
- Add a separate users module with `/users/me`.
- Fetch profile data server-side in Next.js.

## Concepts and terms
- Profile endpoint: authenticated user details.
- Read model: API shape optimized for the UI.
- Guarded page: requires auth to render.

## Fundamentals
- Keep profile responses consistent with DTOs.
- Avoid exposing sensitive fields.
- Use a guard for profile UI.
