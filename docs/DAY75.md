# Day 75 Learning Notes

## Why this implementation is needed
- Producers need a consistent entry point.

## Advantages
- Simple queue interface for future BullMQ integration.

## Disadvantages
- Queue is in-memory only.

## Alternatives and tradeoffs
- Use BullMQ immediately with Redis.

## Concepts and terms
- Producer helper: wrapper that enqueues jobs.

## Fundamentals
- Keep queue operations small and explicit.
