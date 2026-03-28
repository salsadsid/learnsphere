# Day 19 Learning Notes

## Why this implementation is needed
- RBAC keeps privileged actions limited to specific roles.
- Course creation should be restricted to instructors and admins.
- Role middleware centralizes authorization logic.

## Advantages
- Consistent authorization across routes.
- Easier to audit protected endpoints.
- Clear error responses for forbidden access.

## Disadvantages
- Requires role data on every authenticated request.
- Hard-coded roles can limit flexibility.
- Needs careful alignment with product policy.

## Alternatives and tradeoffs
- Use permission scopes instead of fixed roles.
- Delegate authorization to a policy engine.
- Store roles in a separate ACL service.

## Concepts and terms
- RBAC: role-based access control.
- Forbidden: authenticated but not allowed.
- Authorization: permission checks after authentication.

## Fundamentals
- Authenticate first, authorize second.
- Keep role checks close to protected routes.
- Return 403 for forbidden actions.
