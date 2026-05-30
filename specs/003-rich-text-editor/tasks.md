# Tasks: Rich Text Editor

**Input**: Design documents from `/specs/003-rich-text-editor/`

**Prerequisites**: `plan.md`, `spec.md`, `data-model.md`, `contracts/` (all present)

## Phase 1: Setup (Shared Infrastructure)

- [ ] T001 [P] Create TypeScript types for the editor document model in `src/features/editor/lib/types.ts`
- [ ] T002 [P] Create test scaffolding for the editor: `src/features/editor/__tests__/` (ensure Vitest config picks up tests)
- [ ] T003 [P] Create RichTextEditor component shell in `src/features/editor/components/RichTextEditor.tsx`
- [ ] T004 [P] Create EditorToolbar component shell in `src/features/editor/components/EditorToolbar.tsx`
- [ ] T005 [P] Add quickstart developer doc at `specs/003-rich-text-editor/quickstart.md` (validate it exists)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core editor model, serialization, persistence, and sanitization. Must be complete before user stories.

- [ ] T006 [P] Write serialization round-trip unit tests in `src/features/editor/__tests__/serialization.test.ts` (tests must fail first)
- [ ] T007 [P] Implement Document model helper in `src/features/editor/lib/documentModel.ts` (serialize/deserialize functions)
- [ ] T008 [P] Implement persistence adapter glue for editor documents in `src/features/editor/lib/persistenceAdapter.ts` (uses existing local-first adapters)
- [ ] T009 [P] Implement paste sanitization utility in `src/features/editor/lib/sanitize.ts` (preserve supported marks/blocks)
- [ ] T010 [P] Add a contract test validating saved document matches `specs/003-rich-text-editor/contracts/editor-document-contract.md` in `src/features/editor/__tests__/contract/editor-contract.test.ts`

**Checkpoint**: Foundational tasks complete — user story work may begin.

---

## Phase 3: User Story 1 - Compose and format a note (Priority: P1) 🎯 MVP

**Goal**: Provide core authoring features (Bold, Italic, Underline, Strikethrough, Headings H1/H2/H3, Bullet/Numbered lists, Quote, Divider)

**Independent Test**: Tests exercise toggling each formatting mark and block insertion and verify document model and persistence.

### Tests for User Story 1 (MANDATORY)

- [ ] T011 [P] [US1] Unit tests for marks and block formatting in `src/features/editor/__tests__/formatting.test.ts` (red → green)
- [ ] T012 [P] [US1] Integration test that renders `RichTextEditor`, applies formatting from the toolbar, and asserts model changes in `src/features/editor/__tests__/integration/formatting.integration.test.ts`

### Implementation for User Story 1

- [ ] T013 [US1] Implement mark command functions (bold, italic, underline, strikethrough) in `src/features/editor/lib/commands/marks.ts`
- [ ] T014 [US1] Implement block command functions (heading levels, bullet/numbered list, quote, divider) in `src/features/editor/lib/commands/blocks.ts`
- [ ] T015 [US1] Wire toolbar buttons to commands and keyboard shortcuts in `src/features/editor/components/EditorToolbar.tsx`
- [ ] T016 [US1] Render and update document model in `src/features/editor/components/RichTextEditor.tsx` (connect documentModel + persistenceAdapter)
- [ ] T017 [US1] Persist document edits on change using `src/features/editor/lib/persistenceAdapter.ts` (ensure save debounce/atomic write)
- [ ] T018 [US1] Add accessibility attributes and keyboard shortcut support (e.g., Ctrl/Cmd+B for bold) in `src/features/editor/components/*`

**Checkpoint**: US1 should be fully functional and independently verifiable.

---

## Phase 4: User Story 2 - Lightweight code snippets and blocks (Priority: P2)

**Goal**: Support inline code and multi-line code blocks for technical notes.

**Independent Test**: Tests for inline code wrapping and code block preservation of newlines and language hint.

### Tests for User Story 2 (MANDATORY)

- [ ] T019 [P] [US2] Unit tests for inline code mark and code block node in `src/features/editor/__tests__/code.test.ts`

### Implementation for User Story 2

- [ ] T020 [US2] Implement inline code mark in `src/features/editor/lib/marks/inlineCode.ts`
- [ ] T021 [US2] Implement code block node and UI for multi-line code in `src/features/editor/lib/nodes/codeBlock.ts` and integrate rendering/editing in `src/features/editor/components/RichTextEditor.tsx`
- [ ] T022 [US2] Ensure code blocks are preserved by the sanitization import path in `src/features/editor/lib/sanitize.ts`

**Checkpoint**: US2 features stable and tested.

---

## Phase 5: User Story 3 - Checklist and task-like items (Priority: P2)

**Goal**: Allow users to add checklist items with toggleable checked state and persist their state.

**Independent Test**: Checklist toggle unit tests and serialization tests.

### Tests for User Story 3 (MANDATORY)

- [ ] T023 [P] [US3] Unit tests for checklist item creation and toggle persistence in `src/features/editor/__tests__/checklist.test.ts`

### Implementation for User Story 3

- [ ] T024 [US3] Implement Checklist node and item type in `src/features/editor/lib/nodes/checklist.ts`
- [ ] T025 [US3] Implement UI toggle and event handlers in `src/features/editor/components/RichTextEditor.tsx` (update model and persist)
- [ ] T026 [P] [US3] Add contract/unit checks ensuring checklist round-trip in `src/features/editor/__tests__/serialization.test.ts`

**Checkpoint**: US3 passes tests and persists checklist state.

---

## Phase 6: Integration, polish & cross-cutting concerns

- [ ] T027 [P] Integration tests for full save/load flow across UI and persistence in `src/features/editor/__tests__/integration/saveLoad.integration.test.ts`
- [ ] T028 [P] Implement paste handler wiring in `src/features/editor/components/RichTextEditor.tsx` to call `src/features/editor/lib/sanitize.ts` and map pasted HTML to the document model
- [ ] T029 [P] Implement basic undo/redo stack in `src/features/editor/lib/undoRedo.ts` and wire shortcuts
- [ ] T030 [P] Documentation: Update `specs/003-rich-text-editor/quickstart.md`, add example JSON documents in `specs/003-rich-text-editor/examples/` and update developer README

---

## Dependencies & Execution Order

- **Phase 1 (Setup)**: can run immediately and in parallel where marked [P]
- **Phase 2 (Foundational)**: blocks all user stories; must complete before US1/US2/US3 implementation begins
- **User Stories (Phase 3–5)**: tests MUST be written and fail before implementation in each story
- **Integration & Polish**: run after all targeted user stories have passing tests

## Parallel Opportunities

- Type definitions, test scaffolding, and component shells (T001–T004) are parallelizable [P]
- Pure utility modules (documentModel, sanitize, persistenceAdapter) are parallelizable [P]
- Unit tests for separate story features are parallelizable [P]
- Different user stories can be implemented in parallel once foundations are complete

---

## Implementation Strategy

- MVP scope = User Story 1 (Compose and format a note). Complete Setup + Foundational then implement US1 and validate independently.
- Follow TDD strictly: add tests first (marked), confirm failing, implement minimal code to pass, then refactor.
- Keep commits small and atomic; consider running the optional commit hook after major checkpoints.

