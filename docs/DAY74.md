# Day 74 Learning Notes

## Why this implementation is needed
- Background jobs require a shared connection.

## Advantages
- Single connection point for future queue clients.

## Disadvantages
- Stub only until BullMQ is wired.

## Alternatives and tradeoffs
- Directly instantiate BullMQ in each producer.

## Concepts and terms
- Queue connection: shared Redis client config.

## Fundamentals
- Centralize connection configuration.
