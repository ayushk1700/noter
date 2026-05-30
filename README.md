# Noter

A lightweight note-taking app built with Next.js and Tailwind.

## Shared Primitives and Design Baseline

### 1. Centralized Action Menu
All note card variants (canvas, grid, media) share the same `NoteCardActionMenu` component under `src/shared/components/NoteCardActionMenu.tsx`. This guarantees identical operations and interaction models:
- **Available Actions**: Open, Pin/Unpin, Duplicate, Copy Link, Delete.
- **Visual Baseline**: Action triggers and dropdown layouts are fully standardized.
- **Event Isolation**: Safe propagation guards are implemented across all interactions to prevent unwanted bubbling.

### 2. Design Primitives & Tokens
Visual rules and constants are centralized inside `src/shared/styles/noteCardDesign.ts` to govern layout and theme variables:
- **Card Spacing / Padding**: Controlled via `cardPadding` tokens.
- **Menu Sizing**: Regulated via `menuWidth`, `menuRadius`, and `menuGap`.
- **Keyboard / Touch Parity**: Menu includes pointer-hover triggers, touch taps, focus styles, and Escape key listeners.

## Testing and Verification
TDD is fully established under the `tests/` directory using Vitest:
- Integration tests cover canvas, grid, event propagation isolation, and visual alignment.
- Unit tests validate tokens and menu interaction accessibility.
- Run tests: `npm run test`
 