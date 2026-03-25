# Day 1 Learning Notes

## Focus
Clean architecture fundamentals for a modular monolith, with practical boundaries for a Next.js + Node/Express backend.

## Core Concepts
- Layers and dependency flow: outer layers depend on inner layers, never the reverse. A simple rule is "controllers -> use cases -> domain".
- Domain vs application: the domain holds business rules and entities; the application layer orchestrates use cases and policies.
- Infrastructure as detail: database, cache, and external services are adapters that implement interfaces defined inward.
- Separation of concerns: keep HTTP, persistence, and business logic isolated to reduce coupling.
- Stable dependencies: high-level policies should not depend on low-level details; both should depend on abstractions.

## Modular Monolith Principles
- Module boundaries by feature, not by technical layer. Example modules: auth, courses, enrollment, progress.
- Each module owns its data models and use cases; cross-module access goes through explicit APIs or shared contracts.
- Shared code is allowed but should be minimal and stable (e.g., common errors, auth helpers).
- Avoid a "shared everything" anti-pattern that collapses module boundaries.

## Practical Architecture Choices
- Backend folder structure idea (high level):
  - modules/<feature>/domain (entities, value objects)
  - modules/<feature>/use-cases (application services)
  - modules/<feature>/infra (db models, external services)
  - modules/<feature>/http (controllers, routes)
- Frontend structure idea (high level):
  - features/<feature> for pages, hooks, UI
  - shared/ for design system and utilities

## Data Modeling Fundamentals
- Start with core aggregates and flows:
  - User (auth, roles)
  - Course (modules, lessons)
  - Enrollment (user-course relation)
  - Progress (lesson watch state)
- Decide ownership and boundaries: which module owns each aggregate and which events or APIs expose it.
- Define minimal fields first, then evolve; avoid over-optimizing early.
- Prefer explicit relationships over hidden coupling (ids over deep nesting for large collections).

## API Contract Fundamentals
- Design endpoints around use cases, not database tables.
- Keep DTOs stable and versionable; avoid leaking internal schemas to clients.
- Treat pagination and filtering as first-class requirements.
- Separate commands (state changes) from queries (reads) in the API design when possible.

## Key Takeaways
- Clean architecture is mostly about dependency direction and clear module boundaries.
- Start simple, define the core contracts early, and keep infrastructure replaceable.
- A modular monolith scales well if module boundaries are respected.
- Fundamentals first: clear ownership, stable contracts, and minimal coupling.

## Status
- Learning notes captured in this document.
- Day 1 artifacts implemented in the repo per DAY1-IMPLEMENTATION.md.
