# Day 16 Learning Notes

## Why this implementation is needed
- Login is required to authenticate returning users.
- JWT tokens enable stateless auth for APIs.
- Password verification ensures credentials are valid.

## Advantages
- Simple, portable auth tokens.
- Clear separation between login and token issuance.
- Fits well with future refresh token workflows.

## Disadvantages
- JWT secret must be protected.
- Tokens are valid until expiry even if user logs out.
- In-memory store limits real persistence.

## Alternatives and tradeoffs
- Use opaque session tokens with server-side storage.
- Add refresh tokens immediately for longer sessions.
- Store tokens in cookies instead of headers.

## Concepts and terms
- JWT: signed token carrying claims.
- Access token: short-lived credential for API calls.
- Claims: fields embedded in a token payload.

## Fundamentals
- Keep token lifetimes short.
- Store secrets outside code.
- Validate credentials before issuing tokens.
