# Day 48 Learning Notes

## Why this implementation is needed
- Learners should resume where they left off.
- Local tracking works even offline.

## Advantages
- Immediate resume UX.
- No backend dependency for basic progress.

## Disadvantages
- Local data can be cleared by the user.
- No cross-device sync yet.

## Alternatives and tradeoffs
- Store progress only on server.
- Use indexed DB for richer local state.

## Concepts and terms
- Resume UX: prompt to continue playback.
- Local progress: state stored in the browser.

## Fundamentals
- Save progress periodically.
- Avoid excessive local writes.
