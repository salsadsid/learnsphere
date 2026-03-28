# Day 12 Implementation

Goal: add baseline logging (request id + method + path) and log format standard.

## Logging Standard

Format:
```
[requestId] METHOD /path status durationMs
```

Example:
```
[7c6a1d7c-0a40-4c33-9f4e-6128b3c7a9ce] GET /health 200 3.4ms
```

## Middleware

- Added `requestLogger` middleware to attach a request id.
- Returns the request id in the `x-request-id` response header.

## Verification Checklist

- [x] Request id injected
- [x] Method + path logged
- [x] Response header added

## Status
Implemented:
- [x] apps/api/src/shared/logging.ts
- [x] apps/api/src/index.ts
