# Day 5 Learning Notes

## Why this implementation is needed
- Consistent error payloads reduce confusion and simplify frontend handling.
- A centralized helper avoids duplicated error formatting across modules.
- Problem+json is a widely adopted standard for API error responses.

## Advantages
- Predictable error responses across endpoints.
- Easier monitoring and debugging with standardized fields.
- Faster implementation of future endpoints with shared helpers.

## Disadvantages
- Boilerplate if endpoints are few.
- Requires discipline to always use the helper.
- Overly generic error types can hide actionable details.

## Alternatives and tradeoffs
- Use a validation library with built-in error formatting (e.g., Zod).
- Use custom error envelopes for app-specific needs.
- Emit errors as structured logs and keep responses minimal.

## Concepts and terms
- Problem+json: RFC 7807 error format.
- `type`: URI identifying the error class.
- `instance`: URI or path identifying the specific error occurrence.

## Fundamentals
- Errors should be consistent, minimal, and safe to expose.
- Avoid leaking internal stack traces or sensitive data.
- Centralizing error handling keeps behavior uniform over time.
