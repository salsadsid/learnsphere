# Day 70 Learning Notes

## Why this implementation is needed
- Enrollment confirmations are a core notification.
- Queue prep avoids refactors later.

## Advantages
- Clear seam for future async delivery.

## Disadvantages
- Placeholder only; no actual email delivery.

## Alternatives and tradeoffs
- Trigger notifications in a worker process.

## Concepts and terms
- Notification queue: async delivery pipeline.

## Fundamentals
- Keep notification concerns separate from core logic.
