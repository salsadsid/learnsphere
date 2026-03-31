# Day 62 Learning Notes

## Why this implementation is needed
- Enrolled-only access protects paid content.

## Advantages
- Consistent gating in API and UI.

## Disadvantages
- Requires extra requests to check access state.

## Alternatives and tradeoffs
- Embed access flag into course detail payload.

## Concepts and terms
- Access control: permission checks before serving content.

## Fundamentals
- Enforce rules on the server, not just the UI.
