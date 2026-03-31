# Dependency Audit Checklist

## Goals
- Identify vulnerable dependencies.
- Record required updates and risk level.

## API
1. `cd apps/api`
2. `npm audit --json > audit.json`
3. Review high/critical issues.
4. Apply updates with `npm audit fix` when safe.

## Web
1. `cd apps/web`
2. `npm audit --json > audit.json`
3. Review high/critical issues.
4. Apply updates with `npm audit fix` when safe.

## Notes
- Capture follow-up tasks in Plan.md.
- Re-run tests after dependency updates.
