# Tasks: Block Editor Like Notion

## Phase 1: Setup

- [ ] T001 [P] Create shared block editor domain types and exports in `src/features/editor/lib/blockTypes.ts` and `src/features/editor/lib/index.ts`
- [ ] T002 [P] Add block editor persistence adapter interface and local storage implementation in `src/features/editor/lib/persistence.ts`
- [ ] T003 [P] Add block tree utility scaffolding in `src/features/editor/lib/blockTree.ts`
- [ ] T004 [P] Add block command model and menu data in `src/features/editor/lib/blockCommands.ts`

## Phase 2: Foundation

- [ ] T005 Write failing unit tests for block tree operations in `src/features/editor/lib/__tests__/blockTree.test.ts`
- [ ] T006 Write failing unit tests for persistence behavior in `src/features/editor/lib/__tests__/persistence.test.ts`
- [ ] T007 Write failing unit tests for block command parsing and transforms in `src/features/editor/lib/__tests__/blockCommands.test.ts`
- [ ] T008 Implement block tree operations for create, split, move, indent, outdent, and normalize in `src/features/editor/lib/blockTree.ts`
- [ ] T009 Implement persistence load/save behavior for editor state in `src/features/editor/lib/persistence.ts`
- [ ] T010 Implement slash-command and transform helpers in `src/features/editor/lib/blockCommands.ts`

## Phase 3: User Story 1 - Create and edit blocks quickly (Priority: P1)

- [ ] T011 [P] Write failing component tests for the editor shell, inline editing, and save-state indicator in `src/features/editor/components/__tests__/EditorShell.test.tsx`
- [ ] T012 [P] Implement the editor shell page and page-level state provider in `src/app/(workspace)/editor/page.tsx` and `src/features/editor/components/EditorShell.tsx`
- [ ] T013 Implement inline block row rendering and direct editing in `src/features/editor/components/BlockRow.tsx`
- [ ] T014 Implement block type switching UI for heading, list item, quote, callout, divider, and code in `src/features/editor/components/BlockTypeMenu.tsx`
- [ ] T015 Implement save-state indicator with idle, saving, saved, and error states in `src/features/editor/components/SaveStateIndicator.tsx`
- [ ] T016 Add keyboard create/split flow so Enter creates a new block in `src/features/editor/components/EditorShell.tsx`

## Phase 4: User Story 2 - Organize blocks visually and hierarchically (Priority: P1)

- [ ] T017 [P] Write failing tests for drag reorder, indent, and outdent behavior in `src/features/editor/components/__tests__/BlockReorder.test.tsx`
- [ ] T018 [P] Add block drag handles and drop targets in `src/features/editor/components/BlockRow.tsx`
- [ ] T019 Implement block reorder and one-level nesting actions in `src/features/editor/components/BlockTreeView.tsx`
- [ ] T020 Implement parent/child structure rendering and one-level indentation in `src/features/editor/components/BlockChildren.tsx`
- [ ] T021 Add guardrails to prevent invalid hierarchy loops in `src/features/editor/lib/blockTree.ts`

## Phase 5: User Story 3 - Use keyboard shortcuts and block commands (Priority: P2)

- [ ] T022 [P] Write failing tests for slash menu filtering, selection, and command execution in `src/features/editor/components/__tests__/SlashCommandMenu.test.tsx`
- [ ] T023 Implement slash-command menu UI in `src/features/editor/components/SlashCommandMenu.tsx`
- [ ] T024 Implement keyboard shortcut handling for common block actions in `src/features/editor/components/EditorShell.tsx`
- [ ] T025 Wire slash-command selection to block transforms in `src/features/editor/components/BlockTypeMenu.tsx`
- [ ] T026 Add markdown-style transform helpers for common block types in `src/features/editor/lib/blockCommands.ts`

## Phase 6: User Story 4 - Preserve content reliably (Priority: P1)

- [ ] T027 [P] Write failing persistence integration tests for reload restore in `src/features/editor/components/__tests__/PersistenceRestore.test.tsx`
- [ ] T028 Persist editor state after edits, block moves, and nesting changes in `src/features/editor/components/EditorShell.tsx`
- [ ] T029 Restore page state on load in `src/features/editor/components/EditorShell.tsx`
- [ ] T030 Add paste-splitting behavior for multi-line input in `src/features/editor/components/BlockRow.tsx`
- [ ] T031 Add empty-block lifecycle handling and delete-parent behavior in `src/features/editor/lib/blockTree.ts`

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T032 [P] Add accessibility tests for keyboard-only block creation, navigation, and reordering in `src/features/editor/components/__tests__/Accessibility.test.tsx`
- [ ] T033 Improve ARIA labels, focus management, and keyboard reordering fallbacks in `src/features/editor/components/EditorShell.tsx`
- [ ] T034 Update feature documentation and quickstart notes in `specs/002-block-editor-like-notion/quickstart.md`
- [ ] T035 Run full unit and component test suite, fix regressions, and verify TDD evidence in `src/features/editor/**`

## Dependencies

- Phase 1 tasks (T001-T004) should complete before foundation work.
- Foundation tasks (T005-T010) should complete before UI implementation.
- User Story 1 tasks (T011-T016) are the first shippable slice and depend on foundation tasks.
- User Story 2 tasks (T017-T021) depend on the core editor shell and block tree utilities.
- User Story 3 tasks (T022-T026) depend on the editor shell, block type data, and transform helpers.
- User Story 4 tasks (T027-T031) depend on the editor shell persistence path and block tree operations.
- Polish tasks (T032-T035) should happen after core stories are working and validated.

## Parallel Opportunities

- T001-T004 can be started in parallel because they target separate files.
- T005-T007 can be written in parallel before implementation begins.
- T011-T012 can be done in parallel with T013-T015 once the editor shell shape is clear.
- T017-T018 and T022-T023 and T027-T028 can be parallelized within their respective story phases.

## Implementation Strategy

1. Deliver the smallest usable editor slice first: block creation, inline editing, and persistence.
2. Add reordering and nesting next so the editor becomes structurally useful.
3. Add slash commands and keyboard shortcuts after the core block model is stable.
4. Finish with save-state hardening, accessibility, and regression testing.

## Validation Criteria

- All tasks must remain checklist-formatted and executable by an implementation agent.
- Each user story phase should be independently testable.
- The plan must stay aligned with the constitution: TypeScript, TDD, functional components, and no external UI component libraries.
