# Day 65 Learning Notes

## Why this implementation is needed
- Payment webhooks can be delivered multiple times.

## Advantages
- Protects against double-processing.

## Disadvantages
- Requires storing processed event ids.

## Alternatives and tradeoffs
- Use provider-level idempotency tools only.

## Concepts and terms
- Idempotency: repeated calls yield the same result.

## Fundamentals
- Treat webhook handlers as at-least-once.
