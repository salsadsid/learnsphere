# Day 8 Learning Notes

## Why this implementation is needed
- A UI shell gives the app a consistent frame for navigation and layout.
- Client-only session state enables UI flows without backend integration.
- A landing page sets the tone for the product and guides users.

## Advantages
- Clear navigation scaffolding for future pages.
- Fast iteration of auth UI without API dependencies.
- Consistent typography and visual system from day one.

## Disadvantages
- Placeholder auth can drift from real auth behavior.
- UI polish may need refactoring once data is real.
- Requires discipline to keep design system consistent.

## Alternatives and tradeoffs
- Build only layout primitives and skip a marketing page.
- Use a UI kit for faster scaffolding.
- Defer auth placeholders until API endpoints exist.

## Concepts and terms
- UI shell: navigation + layout scaffolding shared across pages.
- Client-only state: data stored in browser memory, not persisted.
- Landing page: a top-level page that explains value and flow.

## Fundamentals
- Keep shared layout components stable early.
- Separate UI state from backend state.
- Design with future data in mind.
