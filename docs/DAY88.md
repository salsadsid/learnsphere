# Day 88 Learning Notes

## Why this implementation is needed
- Refactors reduce complexity and keep diagnostics consistent.

## Advantages
- Shared utilities minimize duplicated logic.
- Repeatable audit steps improve release readiness.

## Disadvantages
- Refactors require careful regression checks.
- Security checks can be noisy without triage.

## Alternatives and tradeoffs
- Delay refactors until after launch (faster delivery, higher debt).
- Use automated security scanners (more coverage, more setup).

## Concepts and terms
- Technical debt: cost of delayed refactors.
- Dependency audit: review of library vulnerabilities.

## Fundamentals
- Keep core utilities centralized to reduce entropy.
