# Day 68 Learning Notes

## Why this implementation is needed
- Payment flows need regression coverage.

## Advantages
- Confidence in webhook and retry behavior.

## Disadvantages
- Requires setting webhook secrets in tests.

## Alternatives and tradeoffs
- Use provider sandbox for integration tests.

## Concepts and terms
- Replay protection: ignore duplicated webhook events.

## Fundamentals
- Test the critical payment path first.
