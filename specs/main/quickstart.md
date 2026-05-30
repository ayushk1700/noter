# Quickstart: Note Card Consistency And Design Baseline

## 1. Prepare

1. Install dependencies:
   - `npm install`
2. Run lint baseline:
   - `npm run lint`

## 2. Write Tests First (TDD)

1. Add unit tests for shared action menu behavior:
   - `tests/unit/note-card-action-menu.test.tsx`
2. Add integration tests for cross-variant consistency:
   - `tests/integration/note-card-consistency.test.tsx`
3. Run tests and confirm they fail before implementation.

## 3. Implement Shared Menu + Design Rules

1. Create shared components/modules:
   - `src/shared/components/NoteCardActionMenu.tsx`
   - `src/shared/lib/noteCardActions.ts`
   - `src/shared/styles/noteCardDesign.ts`
2. Refactor existing variant surfaces to consume shared primitives:
   - `src/features/workspace/components/NoteNode.tsx`
   - `src/features/workspace/components/WorkspaceView.tsx`
   - `src/features/workspace/components/ZenCanvasNoteCard.tsx`

## 4. Validate Behavior

1. Verify all card variants expose identical action trigger/menu behavior.
2. Verify keyboard and touch accessibility for action menu open + action execution.
3. Verify card click/drag behavior is unchanged when menu interactions occur.

## 5. Final Checks

1. Run lint and tests.
2. Confirm no external UI component library was introduced.
3. Confirm all updated code remains TypeScript and functional React.