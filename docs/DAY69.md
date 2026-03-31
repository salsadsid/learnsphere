# Day 69 Learning Notes

## Why this implementation is needed
- Payment code grows quickly without structure.

## Advantages
- Clear separation between status lookup and webhook handling.

## Disadvantages
- More files to maintain.

## Alternatives and tradeoffs
- Keep logic in routes for smaller projects.

## Concepts and terms
- Payment status service: single source for state.

## Fundamentals
- Keep handlers thin and reusable.
