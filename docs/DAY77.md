# Day 77 Learning Notes

## Why this implementation is needed
- Notification delivery can fail.

## Advantages
- Retry improves success rates.
- Dead-letter queue prevents infinite loops.

## Disadvantages
- Requires monitoring to reprocess dead letters.

## Alternatives and tradeoffs
- Use provider-level retries only.

## Concepts and terms
- Dead-letter queue: storage for failed jobs.

## Fundamentals
- Keep retry counts finite.
