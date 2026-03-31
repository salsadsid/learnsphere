# Day 86 Implementation

Goal: add API performance diagnostics and latency targets.

## Changes
- Added request latency metrics middleware with p95 target warnings.
- Exposed a latency snapshot endpoint for quick inspection.
- Added env-configurable p95 target and sample size.

## Verification Checklist
- [x] Requests record latency samples.
- [x] /metrics/latency returns p50/p95 snapshots.
- [x] P95 target is configurable via env.

## Status
Implemented:
- [x] Latency metrics middleware
- [x] Latency target configuration
