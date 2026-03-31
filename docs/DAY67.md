# Day 67 Learning Notes

## Why this implementation is needed
- Users should not be double-charged.
- Failed payments need a retry path.

## Advantages
- Safe handling of duplicate checkout attempts.
- Clear recovery for failed payments.

## Disadvantages
- Manual retry relies on user action.

## Alternatives and tradeoffs
- Auto-retry payments with backoff.

## Concepts and terms
- Double pay prevention: reuse paid/pending sessions.

## Fundamentals
- Idempotency is critical for payment safety.
