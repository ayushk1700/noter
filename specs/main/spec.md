# Feature Specification: Note Card Consistency And Design Baseline

**Feature Branch**: `main`

**Created**: 2026-05-29

**Status**: Draft

**Input**: User description: "Analyze the current codebase and tell me which existing files need to be modified, and which new files must be created to support these features. note cards consistency design and follow basic design rules of projects"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Consistent Action Menu Across Cards (Priority: P1)

As a user, I want every note card variant to expose the same hover action menu pattern so interaction is predictable.

**Why this priority**: Inconsistent interaction across card variants causes direct UX friction in core note workflows.

**Independent Test**: Open workspace in canvas and grid modes, hover any note card variant, verify the same trigger and menu actions are available.

**Acceptance Scenarios**:

1. **Given** a canvas note card, **When** I hover the card header area, **Then** a consistent 3-dot trigger appears and opens the same action menu.
2. **Given** a grid note card, **When** I hover the card header area, **Then** the same trigger and action menu behavior appears.

---

### User Story 2 - Shared Design Rules For Note Cards (Priority: P2)

As a maintainer, I want baseline note-card design rules centralized so visual and interaction behavior does not drift between components.

**Why this priority**: Shared design rules reduce duplicated styling logic and regressions during feature iteration.

**Independent Test**: Update one shared design token and verify all note-card variants reflect the change.

**Acceptance Scenarios**:

1. **Given** shared design constants/tokens, **When** card components render, **Then** spacing, radius, trigger size, and menu transition are consistent.
2. **Given** a new note-card variant is added, **When** it uses shared primitives, **Then** interaction and appearance remain aligned without ad-hoc CSS.

---

### User Story 3 - Safe And Accessible Interaction Defaults (Priority: P3)

As a user, I want note-card actions to stay accessible and safe so keyboard users and users on touch devices can still use core actions.

**Why this priority**: A hover-only model can exclude non-pointer users and produce accidental destructive actions.

**Independent Test**: Navigate a note card with keyboard, open action menu via focus/keyboard, and verify destructive actions require explicit click.

**Acceptance Scenarios**:

1. **Given** keyboard focus on menu trigger, **When** Enter/Space is used, **Then** the action menu opens and actions are reachable.
2. **Given** a touch-only environment, **When** user taps menu trigger, **Then** the same actions are available without hover dependency.

### Edge Cases

- What happens when a card is very narrow and the menu would overflow outside viewport?
- What happens when a card is in drag/resize mode while pointer enters menu area?
- What happens when multiple menus are opened rapidly across cards?
- What happens if note metadata is missing (untitled, empty body, missing date)?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present a consistent action trigger and menu layout for canvas, grid, and media note-card variants.
- **FR-002**: System MUST expose the same action set (pin/unpin, duplicate, copy link, delete) across card variants.
- **FR-003**: System MUST centralize note-card design rules in reusable constants/styles to prevent drift.
- **FR-004**: System MUST support keyboard and touch opening of the action menu in addition to hover.
- **FR-005**: System MUST prevent accidental note opening when users click/tap menu actions.
- **FR-006**: Implementation MUST be written in TypeScript for application source code.
- **FR-007**: React UI changes MUST use functional components and hooks.
- **FR-008**: Solution MUST NOT introduce external UI component library dependencies.
- **FR-009**: Tests MUST be authored before implementation and demonstrate failing-to-passing behavior.

### Key Entities *(include if feature involves data)*

- **NoteCardDisplayState**: Presentation-level state for a note card variant (hovered, focused, menu open, dragging).
- **NoteCardActionMenu**: Shared action menu contract with available actions and visibility behavior.
- **NoteCardDesignTokenSet**: Reusable style values for card shell, trigger, spacing, and menu behavior.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of note-card variants use one shared action-menu contract.
- **SC-002**: Designers/developers can update menu spacing/radius in one location and see updates across all card variants.
- **SC-003**: Keyboard users can open and execute all menu actions without pointer hover.
- **SC-004**: No regression in note open, drag, resize, and action click interactions in smoke tests.
- **SC-005**: New behavior changes include test evidence proving red-green-refactor completion.

## Assumptions

- Existing note actions (pin, duplicate, copy link, delete) remain the required action set.
- No backend schema changes are needed; this is a frontend behavior and design consistency feature.
- Existing Tailwind + React infrastructure remains the UI implementation base.