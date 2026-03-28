# Day 6 Learning Notes

## Why this implementation is needed
- Environment configuration keeps secrets and deploy settings out of code.
- `.env.example` files document required variables for each app.
- A config loader centralizes parsing and default values.

## Advantages
- Clear setup steps for new contributors.
- Fewer runtime surprises from missing variables.
- Easier future validation when more settings are added.

## Disadvantages
- Defaults can mask missing env issues in production.
- Config drift if docs are not updated.
- Requires discipline to keep secrets out of examples.

## Alternatives and tradeoffs
- Use a config library (e.g., envalid) for strict validation.
- Store config in a dedicated secrets manager in production.
- Add per-environment `.env` files for dev/staging.

## Concepts and terms
- Twelve-Factor config: store configuration in the environment.
- `.env.example`: non-secret template for local setup.
- Config loader: a module that reads and parses env vars.

## Fundamentals
- Treat env variables as the source of truth for deploy settings.
- Keep defaults safe and conservative.
- Validate critical config before booting the app.
