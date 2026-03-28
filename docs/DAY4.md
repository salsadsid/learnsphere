# Day 4 Learning Notes

## Why this implementation is needed
- Role definitions create a stable contract for authorization decisions.
- An audit log shape standardizes how actions are recorded across modules.
- Clear types reduce ambiguity between HTTP inputs, domain models, and storage.

## Advantages
- Stronger authorization guarantees with explicit roles.
- Easier observability: audit events can be consistent and searchable.
- Safer refactors: fewer stringly-typed role checks.

## Disadvantages
- Role changes require touching types and downstream code.
- Minimal audit shape may need expansion as features grow.
- Too many roles early can overcomplicate permission logic.

## Alternatives and tradeoffs
- Use a permissions matrix instead of fixed roles.
- Store audit data as an append-only event stream.
- Allow custom roles stored in the database with validation rules.

## Concepts and terms
- RBAC: role-based access control.
- Audit log: a record of who did what and when.
- Actor: the user or system that initiated an action.

## Fundamentals
- Roles should be few, stable, and easy to reason about.
- Audit logs should be append-only and tamper-resistant.
- The best time to design audit shapes is before implementation details spread.
