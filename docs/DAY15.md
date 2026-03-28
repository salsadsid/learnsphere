# Day 15 Learning Notes

## Why this implementation is needed
- Registration is the entry point for most auth flows.
- Hashing protects credentials at rest.
- Validation ensures clean inputs before creating users.

## Advantages
- Secure password handling from day one.
- Clear error responses for invalid requests.
- Duplicate protection prevents account collisions.

## Disadvantages
- In-memory store is not persistent.
- No email verification or rate limiting yet.
- Hashing adds compute overhead per request.

## Alternatives and tradeoffs
- Use argon2 instead of bcrypt.
- Store users in MongoDB with unique email index.
- Add email verification before account activation.

## Concepts and terms
- Password hashing: one-way transformation for stored credentials.
- Salt rounds: cost factor used by bcrypt.
- Register DTO: request and response contract for registration.

## Fundamentals
- Never store raw passwords.
- Validate inputs before writing.
- Handle duplicates explicitly.
