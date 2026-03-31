# Day 26 Learning Notes

## Why this implementation is needed
- Logout must revoke active refresh tokens.
- Users expect explicit sign-out behavior.
- Revocation endpoints enable future device management.

## Advantages
- Session cleanup is explicit and auditable.
- Revocation endpoint supports admin workflows later.
- Frontend sign-out becomes deterministic.

## Disadvantages
- In-memory revocation resets on restart.
- Extra endpoint without persistence.
- Slightly more client complexity.

## Alternatives and tradeoffs
- Use a single logout endpoint only.
- Store refresh tokens in a database and revoke there.
- Add device-specific token tracking.

## Concepts and terms
- Token revocation: invalidating refresh tokens.
- Logout flow: client + server coordination.
- Session invalidation: clearing stored credentials.

## Fundamentals
- Always clear local tokens after server revoke.
- Keep revoke responses minimal.
- Audit successful revoke events.
