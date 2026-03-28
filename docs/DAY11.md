# Day 11 Learning Notes

## Why this implementation is needed
- Validation prevents invalid inputs from reaching core logic.
- A shared wrapper keeps error handling consistent across endpoints.
- Schema validation enables type-safe parsing for future DTOs.

## Advantages
- Clear, reusable schemas with explicit error messages.
- Fewer duplicated validation checks.
- Easier to add new request shapes.

## Disadvantages
- Adds a dependency to the API layer.
- Requires care to keep schema messages aligned with UX.
- Slight overhead in request processing.

## Alternatives and tradeoffs
- Use Joi or Yup for validation.
- Validate only at the boundary and trust internal layers.
- Generate schemas from OpenAPI or shared contracts.

## Concepts and terms
- Schema validation: declarative rules for input data.
- Safe parsing: returns data or issues without throwing.
- Boundary validation: checking inputs at the HTTP edge.

## Fundamentals
- Validate as early as possible.
- Keep schemas close to HTTP DTOs.
- Standardize error responses for clients.
