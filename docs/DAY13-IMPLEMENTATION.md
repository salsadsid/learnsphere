# Day 13 Implementation

Goal: create health and readiness endpoints and add simple uptime checks.

## Endpoints

- `GET /health` returns service liveness and uptime.
- `GET /ready` returns readiness (no external deps yet) and uptime.

## Response Shape

```json
{
  "ok": true,
  "uptimeSeconds": 123
}
```

## Verification Checklist

- [x] Health endpoint returns uptime
- [x] Readiness endpoint returns uptime
- [x] Uptime derived from process start

## Status
Implemented:
- [x] apps/api/src/index.ts
