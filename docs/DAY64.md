# Day 64 Learning Notes

## Why this implementation is needed
- Webhooks confirm payment status from providers.

## Advantages
- Server trusts provider-signed payloads.

## Disadvantages
- Requires secret management.

## Alternatives and tradeoffs
- Poll payment provider status (less reliable).

## Concepts and terms
- Webhook signature: HMAC to verify sender authenticity.

## Fundamentals
- Always verify webhooks server-side.
