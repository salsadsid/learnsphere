# Day 17 Learning Notes

## Why this implementation is needed
- Refresh tokens keep sessions alive without frequent logins.
- Rotation reduces replay risk after token theft.
- Logout requires a revocation mechanism.

## Advantages
- Short-lived access tokens with long-lived refresh tokens.
- Immediate invalidation path for compromised tokens.
- Clear separation between access and refresh lifecycles.

## Disadvantages
- In-memory store is not durable.
- Rotation adds complexity to auth flows.
- Requires careful handling on the client.

## Alternatives and tradeoffs
- Store refresh tokens in a database with hashes.
- Use opaque tokens with server-side session records.
- Add device/session metadata for auditing.

## Concepts and terms
- Refresh token: long-lived credential to obtain new access tokens.
- Rotation: revoke and replace refresh tokens on use.
- Revoke list: stored record of invalidated tokens.

## Fundamentals
- Rotate tokens on every refresh.
- Revoke tokens on logout.
- Avoid long-lived access tokens.
