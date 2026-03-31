# Day 58 Learning Notes

## Why this implementation is needed
- Video playback failures are common on flaky connections.
- Learners need a clear recovery path.

## Advantages
- Clear feedback instead of a silent failure.
- Retry keeps users in the learning flow.

## Disadvantages
- Basic retry does not resolve all playback issues.

## Alternatives and tradeoffs
- Auto-retry with exponential backoff.
- Fallback to a lower bitrate source.

## Concepts and terms
- Playback error: failed media load or decode.
- Retry UI: explicit action to reload playback.

## Fundamentals
- Provide human-readable error messages.
- Keep recovery actions simple.
