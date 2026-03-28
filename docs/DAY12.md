# Day 12 Learning Notes

## Why this implementation is needed
- Request tracing is essential for debugging and support.
- A standard log format keeps logs searchable and consistent.
- Adding request ids early avoids refactors later.

## Advantages
- Easier to correlate client reports with server logs.
- Low overhead baseline observability.
- Compatible with future log aggregation.

## Disadvantages
- Console logs can be noisy without filtering.
- Request ids must be propagated to downstream services.
- Requires consistent usage across routes.

## Alternatives and tradeoffs
- Use structured JSON logs instead of plain text.
- Integrate a logger library (pino, winston).
- Generate request ids at the edge/gateway.

## Concepts and terms
- Request id: unique identifier per request.
- Traceability: ability to follow a request across systems.
- Log format standard: consistent structure for logs.

## Fundamentals
- Log at boundaries with minimal but useful context.
- Keep formats consistent for tooling.
- Avoid logging sensitive data.
