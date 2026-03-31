# Day 59 Learning Notes

## Why this implementation is needed
- Analytics events reveal how learners engage.
- Snapshots provide a lightweight view of watch time.

## Advantages
- Better insight into engagement patterns.
- Enables instructor reporting.

## Disadvantages
- More writes during playback sessions.

## Alternatives and tradeoffs
- Batch events client-side.
- Record only lesson completion events.

## Concepts and terms
- Event capture: logging playback actions.
- Snapshot: periodic state record of playback position.

## Fundamentals
- Keep payloads small.
- Focus on actionable signals.
