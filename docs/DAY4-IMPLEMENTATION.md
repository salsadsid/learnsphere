# Day 4 Implementation

Goal: draft role model and add an audit log entry shape.

## Role Model

- Added `UserRole` union type for: student, instructor, admin.
- Applied `UserRole` to `AuthUser.role` and `RegisterResponseDto.role`.

```ts
export type UserRole = "student" | "instructor" | "admin";
```

## Audit Log Entry Shape

- Added `AuditLogEntry` type with a minimal who/what/when shape.

```ts
export type AuditLogEntry = {
  id: string;
  actorId: UserId | "system";
  actorRole?: UserRole;
  action: string;
  subject: string;
  createdAt: Date;
};
```

## Verification Checklist

- [x] Role model type created
- [x] Role type applied to auth user and DTO
- [x] Audit log entry shape added

## Status
Implemented:
- [x] apps/api/src/modules/auth/domain/types.ts
- [x] apps/api/src/modules/auth/http/dto.ts
