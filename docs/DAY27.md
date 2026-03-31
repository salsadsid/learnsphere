# Day 27 Learning Notes

## Why this implementation is needed
- Users need clear feedback when sessions expire.
- Forbidden states should be explicit, not silent.
- Better error messaging reduces support churn.

## Advantages
- Clear UX for auth failures.
- Redirects preserve the intended destination.
- Guards communicate access issues early.

## Disadvantages
- More client logic and branches.
- Potential duplication between pages and guards.
- Requires consistent error messaging.

## Alternatives and tradeoffs
- Show a global toast for auth errors.
- Use middleware for server-side redirects.
- Add an error boundary per route group.

## Concepts and terms
- Session expiry: access token is no longer valid.
- Forbidden: user is authenticated but lacks access.
- Redirect reason: query param to display UX context.

## Fundamentals
- Explain why the user is redirected.
- Keep guard states deterministic.
- Always clear tokens on unauthorized responses.
