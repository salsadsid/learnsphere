# Day 56 Learning Notes

## Why this implementation is needed
- Frequent progress writes can slow playback.
- Optimistic UI keeps learners focused.

## Advantages
- Reduced network traffic during playback.
- Faster perceived response when completing lessons.

## Disadvantages
- Optimistic updates require rollback handling.

## Alternatives and tradeoffs
- Server-side batching of progress updates.
- Background sync worker for saves.

## Concepts and terms
- Throttling: limiting update frequency.
- Optimistic UI: update client state before server confirmation.

## Fundamentals
- Protect the critical path (video playback).
- Provide fast feedback without hiding errors.
