# Day 63 Learning Notes

## Why this implementation is needed
- Payments gate enrollment and access.

## Advantages
- Clear separation between checkout and enrollment.

## Disadvantages
- Mock provider only; no real charges.

## Alternatives and tradeoffs
- Integrate Stripe checkout directly.

## Concepts and terms
- Checkout session: temporary payment intent.

## Fundamentals
- Make checkout creation idempotent.
