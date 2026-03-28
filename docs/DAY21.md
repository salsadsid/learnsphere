# Day 21 Learning Notes

## Why this implementation is needed
- Protected routes need to stay private even on the client.
- Access tokens expire; users should not be forced to re-login every hour.
- Refresh flows keep sessions smooth and consistent.

## Advantages
- Users are redirected to sign in when sessions expire.
- Refresh tokens reduce frequent logins.
- Shared helpers make guarded fetch calls consistent.

## Disadvantages
- Client-side token storage still carries XSS risk.
- Guards run after initial render, so protected pages briefly load.
- Refresh logic adds complexity to every request.

## Alternatives and tradeoffs
- Use HTTP-only cookies and server middleware for SSR protection.
- Store auth state in a global context and hydrate from `/me`.
- Use Next.js middleware for edge-based redirects.

## Concepts and terms
- Auth guard: a client gate that verifies a session before showing content.
- Refresh flow: exchanging a refresh token for a new access token.
- Retry logic: re-issuing a request after refreshing a token.

## Fundamentals
- Always clear tokens on refresh failure.
- Retry only once to avoid loops.
- Keep guard UI explicit while checking auth.
