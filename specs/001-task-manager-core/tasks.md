# Tasks: Task Manager Core

1. Initialize feature scaffolding
   - Create feature folder under `src/features/tasks` and shared types under `src/shared/lib/types.ts`
   - Add persistence adapter interface file `src/shared/lib/persistence.ts`

2. Implement data models & utilities
   - Define Task, Subtask, List, RecurrenceRule types
   - Implement `recurrenceCalculator` with unit tests (Vitest)

3. Persistence adapter (localStorage)
   - Implement LocalStorageAdapter that implements PersistenceAdapter
   - Add simple IndexedDB fallback using `idb-keyval` (optional)
   - Unit tests for adapter read/write

4. Lists UI and provider
   - Implement ListsProvider context for lists and ordering
   - Create ListSidebar component with create/delete list flows
   - Unit/component tests

5. Task list & cards
   - Implement ListView and TaskCard
   - TaskCard shows title, due date, subtask count, and quick actions (open/edit/complete)
   - Tests for TaskCard behavior

6. Task editor modal
   - Implement TaskEditorModal for create/edit: title, description, dueDate, recurrence, subtasks
   - SubtaskList editable UI
   - Validation and save to adapter

7. Drag-and-drop ordering
   - Implement native HTML5 DnD handlers in ListView; update ordering in ListsProvider
   - Keyboard fallback actions (move up/move down)
   - Integration tests simulating drag/drop and keyboard reorder

8. Recurring task handling
   - On task complete, if recurrence exists, compute next due date via recurrenceCalculator and create/update next instance
   - Add unit tests covering daily, weekly, monthly, DST and month-end behavior

9. Persistence & sync polish
   - Debounce writes, ensure atomic updates
   - Provide export/import JSON for backup

10. Accessibility & a11y testing
   - Ensure keyboard access to all controls, ARIA for dialogs and drag handles
   - Run axe or manual checks

11. Tests, CI, and documentation
   - Add comprehensive tests: unit + integration
   - Update README and component docs
   - Prepare PR: branch, commit, and description

Status: Ready to start — tasks are dependency-ordered and sized for small iterations. Pick a task to start and I will implement it TDD-first.
