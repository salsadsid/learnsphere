# Day 20 Learning Notes

## Why this implementation is needed
- Auth UI unblocks real user flows.
- Frontend integration validates API contracts early.
- User feedback surfaces validation errors quickly.

## Advantages
- Clear login/register paths for users.
- Faster validation of backend auth endpoints.
- Provides a base for future auth state handling.

## Disadvantages
- Client-side token storage requires careful security considerations.
- No refresh handling yet in the UI.
- Styling may need refinement once flows expand.

## Alternatives and tradeoffs
- Use server actions for auth calls.
- Store tokens in HTTP-only cookies.
- Add a shared auth provider context early.

## Concepts and terms
- Client-side auth: browser-managed tokens.
- API base URL: environment-driven backend origin.
- Form state: UI state for user inputs.

## Fundamentals
- Keep auth flows minimal and clear.
- Validate inputs before submission.
- Handle error states explicitly.
