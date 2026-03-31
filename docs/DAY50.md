# Day 50 Learning Notes

## Why this implementation is needed
- Learners can watch on multiple devices.
- Conflicts must resolve predictably.

## Advantages
- Simple latest-update wins rule.
- Prevents overwriting newer progress.

## Disadvantages
- Requires client timestamps.
- Edge cases if clocks drift.

## Alternatives and tradeoffs
- Use server timestamps only.
- Track per-device history.

## Concepts and terms
- Conflict resolution: deciding which update wins.
- Stale update: older progress write.

## Fundamentals
- Keep conflict rules deterministic.
- Return server state on conflict.
