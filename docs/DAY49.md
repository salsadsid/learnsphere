# Day 49 Learning Notes

## Why this implementation is needed
- Learners need progress sync across devices.
- Backend storage persists progress.

## Advantages
- Central progress source of truth.
- Enables future analytics.

## Disadvantages
- Requires auth for progress sync.
- In-memory store resets on restart.

## Alternatives and tradeoffs
- Store progress only locally.
- Use a dedicated progress database.

## Concepts and terms
- Progress sync: writing playback position to server.

## Fundamentals
- Save frequently but not excessively.
- Keep payloads small.
