# Research: Note Card Consistency And Design Baseline

## Decision 1: Consolidate card menu UI into one shared component

**Decision**: Create a reusable `NoteCardActionMenu` component and consume it from canvas/grid/media note-card renderers.

**Rationale**: Current action-menu UI is duplicated across multiple components, which causes style and behavior drift.

**Alternatives considered**:
- Keep per-component menu markup and manually sync: rejected due to high regression risk.
- Use an external UI menu library: rejected by constitution (no external UI component libraries).

## Decision 2: Centralize note-card design tokens in local shared styles

**Decision**: Define note-card spacing, radius, trigger size, and menu transition rules in a local shared token module.

**Rationale**: A tokenized source of truth makes consistency enforceable and reduces ad-hoc class divergence.

**Alternatives considered**:
- Leave tokens inline in each component: rejected because drift already exists.
- Global CSS-only constants without typed access: rejected because TypeScript-level discoverability and reuse are weaker.

## Decision 3: Add keyboard/touch parity for menu access

**Decision**: Keep hover as primary desktop interaction and add explicit trigger focus/tap behavior to support keyboard and touch users.

**Rationale**: Hover-only controls are not sufficient for accessibility and non-pointer environments.

**Alternatives considered**:
- Hover-only menu: rejected due to accessibility and mobile usability gaps.
- Always-visible menu: rejected because it adds visual clutter to cards.

## Decision 4: Enforce TDD with frontend test stack

**Decision**: Add/standardize Vitest + React Testing Library for card menu behavior and cross-variant consistency tests.

**Rationale**: Constitution mandates TDD; interaction-heavy UI requires component and integration-level checks.

**Alternatives considered**:
- Rely only on manual QA: rejected; does not satisfy TDD mandate.
- Cypress-only end-to-end tests: rejected for this feature scope because unit/integration feedback is needed earlier in cycle.

## Decision 5: Security and safety constraints for card actions

**Decision**: Preserve event isolation (`stopPropagation`) for menu actions and explicitly guard destructive actions from accidental card-open side effects.

**Rationale**: Action clicks must never trigger unrelated navigation/editing behavior.

**Alternatives considered**:
- Implicit propagation control only at parent container: rejected due to fragile interaction coupling.
- Deferred delete confirmation in this scope: deferred; out of current feature unless product requirement changes.