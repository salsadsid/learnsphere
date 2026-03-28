# Day 18 Learning Notes

## Why this implementation is needed
- Protected routes enforce authentication for private data.
- Middleware centralizes token verification logic.
- Attaching user context simplifies downstream handlers.

## Advantages
- Reusable auth enforcement across routes.
- Clear API behavior for unauthorized requests.
- Foundation for role-based authorization.

## Disadvantages
- Requires token verification on every request.
- In-memory user store limits realism.
- JWT claims need to stay consistent with user model.

## Alternatives and tradeoffs
- Use opaque tokens with server-side session storage.
- Cache decoded tokens for performance.
- Move auth checks to an API gateway.

## Concepts and terms
- Middleware: reusable request handler in the chain.
- Bearer token: Authorization header with access token.
- Claims: data embedded in JWT.

## Fundamentals
- Validate tokens early in the request lifecycle.
- Return 401 for unauthenticated requests.
- Keep auth logic centralized.
