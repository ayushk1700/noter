# Tasks: Note Card Consistency And Design Baseline

**Input**: Design documents from `/specs/main/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Test tasks are mandatory. Write tests first and confirm they fail before implementation.

**Organization**: Tasks are grouped by user story so each story can be implemented and validated independently.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish test and implementation scaffolding for this feature.

- [X] T001 Add test scripts and test dependencies in package.json
- [X] T002 Create frontend test configuration in vitest.config.ts
- [X] T003 [P] Create test setup utilities in tests/setup.ts
- [X] T004 [P] Create test folder scaffolding in tests/unit/.gitkeep and tests/integration/.gitkeep

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared contracts and primitives required by all user stories.

**⚠️ CRITICAL**: Complete this phase before user story implementation.

- [ ] T005 Create shared note-card action types and handlers in src/shared/lib/noteCardActions.ts
- [ ] T006 Create shared note-card design tokens in src/shared/styles/noteCardDesign.ts
- [ ] T007 Create reusable note-card action menu component in src/shared/components/NoteCardActionMenu.tsx
- [ ] T008 Add shared menu/token utility classes in src/app/globals.css
- [ ] T009 Align feature contract with implementation details in specs/main/contracts/note-card-ui-contract.md

**Checkpoint**: Shared primitives are ready and user stories can proceed.

---

## Phase 3: User Story 1 - Consistent Action Menu Across Cards (Priority: P1) 🎯 MVP

**Goal**: Deliver one consistent action-menu interaction across canvas/grid/media note-card variants.

**Independent Test**: Hover note cards in canvas and grid modes and confirm identical trigger/menu actions.

### Tests for User Story 1 (MANDATORY) ⚠️

- [ ] T010 [P] [US1] Add contract parity test for shared card menu actions in tests/integration/note-card-action-contract.test.tsx
- [ ] T011 [P] [US1] Add canvas menu interaction test in tests/integration/canvas-note-card-menu.test.tsx
- [ ] T012 [P] [US1] Add grid menu interaction test in tests/integration/grid-note-card-menu.test.tsx

### Implementation for User Story 1

- [ ] T013 [US1] Refactor standard canvas note card actions to use shared menu in src/features/workspace/components/NoteNode.tsx
- [ ] T014 [US1] Refactor standalone media note card actions to use shared menu in src/features/workspace/components/NoteNode.tsx
- [ ] T015 [US1] Refactor loose-grid note card actions to use shared menu in src/features/workspace/components/WorkspaceView.tsx
- [ ] T016 [US1] Refactor folder-grid note card actions to use shared menu in src/features/workspace/components/WorkspaceView.tsx
- [ ] T017 [US1] Normalize card trigger/menu container behavior in src/features/workspace/components/ZenCanvasNoteCard.tsx
- [ ] T018 [US1] Harden action click isolation with propagation guards in src/features/workspace/components/NoteNode.tsx and src/features/workspace/components/WorkspaceView.tsx

**Checkpoint**: User Story 1 is fully functional and independently testable.

---

## Phase 4: User Story 2 - Shared Design Rules For Note Cards (Priority: P2)

**Goal**: Centralize note-card design tokens and remove duplicated style rules.

**Independent Test**: Change one shared token and verify all note-card variants update consistently.

### Tests for User Story 2 (MANDATORY) ⚠️

- [ ] T019 [P] [US2] Add shared token usage test for note-card menu primitives in tests/unit/note-card-design-tokens.test.ts
- [ ] T020 [P] [US2] Add cross-variant style consistency test in tests/integration/note-card-visual-consistency.test.tsx

### Implementation for User Story 2

- [ ] T021 [US2] Replace duplicated menu/card class constants with shared tokens in src/features/workspace/components/NoteNode.tsx
- [ ] T022 [US2] Replace duplicated menu/card class constants with shared tokens in src/features/workspace/components/WorkspaceView.tsx
- [ ] T023 [US2] Apply shared tokenized classes to canvas shell behaviors in src/features/workspace/components/ZenCanvasNoteCard.tsx
- [ ] T024 [US2] Document design baseline and token ownership in README.md and specs/main/contracts/note-card-ui-contract.md

**Checkpoint**: User Stories 1 and 2 both work independently with centralized design rules.

---

## Phase 5: User Story 3 - Safe And Accessible Interaction Defaults (Priority: P3)

**Goal**: Ensure keyboard/touch access and safe action handling without hover-only dependency.

**Independent Test**: Open the menu by keyboard and touch, execute actions, and verify no accidental card-open side effects.

### Tests for User Story 3 (MANDATORY) ⚠️

- [ ] T025 [P] [US3] Add keyboard open/close accessibility test for action menu in tests/unit/note-card-menu-accessibility.test.tsx
- [ ] T026 [P] [US3] Add event-isolation safety test for menu actions in tests/integration/note-card-menu-event-isolation.test.tsx

### Implementation for User Story 3

- [ ] T027 [US3] Add keyboard-triggered open/close and Escape handling in src/shared/components/NoteCardActionMenu.tsx
- [ ] T028 [US3] Add touch/click trigger fallback behavior in src/shared/components/NoteCardActionMenu.tsx
- [ ] T029 [US3] Add focus management and aria labels in src/shared/components/NoteCardActionMenu.tsx
- [ ] T030 [US3] Update note-card trigger usage to pass accessibility labels in src/features/workspace/components/NoteNode.tsx and src/features/workspace/components/WorkspaceView.tsx
- [ ] T031 [US3] Enforce safe destructive-action execution flow in src/shared/lib/noteCardActions.ts and src/features/workspace/components/NoteNode.tsx

**Checkpoint**: All user stories are independently functional and accessible.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening and validation across stories.

- [ ] T032 [P] Update quickstart verification steps in specs/main/quickstart.md
- [ ] T033 Validate and update implementation context in specs/main/plan.md and specs/main/research.md
- [ ] T034 [P] Finalize regression checklist notes in README.md

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1): no dependencies
- Foundational (Phase 2): depends on Setup
- User Stories (Phases 3-5): depend on Foundational
- Polish (Phase 6): depends on completion of desired user stories

### User Story Dependencies

- US1 (P1): starts after Foundational; no dependency on US2/US3
- US2 (P2): starts after Foundational; can run after or in parallel with US1 where file conflicts are managed
- US3 (P3): starts after Foundational; builds on shared menu from Foundational and integrates with US1 surfaces

### Within Each User Story

- Write tests first and confirm failure
- Implement minimal behavior to pass tests
- Refactor while preserving passing tests

---

## Parallel Execution Examples

### User Story 1

- Run T010, T011, and T012 in parallel (different test files).
- After tests are written, T015 and T017 can be developed in parallel while T013/T014 are in progress.

### User Story 2

- Run T019 and T020 in parallel.
- T022 and T023 can run in parallel after T006 is complete.

### User Story 3

- Run T025 and T026 in parallel.
- T028 and T029 can run in parallel after T027 establishes base menu state handling.

---

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Complete all US1 tests and implementation tasks.
3. Validate US1 in isolation before moving to US2.

### Incremental Delivery

1. Ship US1 for interaction consistency.
2. Add US2 for maintainable design-token consistency.
3. Add US3 for accessibility and safety hardening.

### Team Parallelization

1. One developer: shared menu primitives (Phase 2).
2. One developer: US1 integration in workspace components.
3. One developer: tests and accessibility hardening (US3) after shared menu is stable.
