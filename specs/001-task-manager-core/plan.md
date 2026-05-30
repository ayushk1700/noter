# Implementation Plan: Task Manager Core

Feature: specs/001-task-manager-core/spec.md

Created: 2026-05-29

Goal: Implement a Next.js (app-router) Task Manager MVP that provides lists, tasks with plain-text descriptions, due dates/times, one-layer subtasks, recurring tasks (roll-forward), and manual drag-and-drop organization using local state for ordering. Persist data locally (localStorage/IndexedDB) with an adapter pattern to allow later server-backed sync.

Summary of approach
- Use the existing Next.js app structure (app/) and Tailwind CSS styles. Build React functional components in TypeScript following repository conventions.
- Use native browser drag-and-drop (HTML5 Drag and Drop) for an MVP ordering implementation and local React state for ordering within lists. Provide an adapter surface so the ordering can be persisted to localStorage and later to a server API.
- Keep UI primitives lightweight and shared: ListView, TaskCard, TaskEditorModal, SubtaskList, RecurrencePicker, and persistence adapter.
- TDD first: write unit tests (Vitest + React Testing Library) that fail, implement code, then make tests pass. Add integration tests for drag-and-drop logic and recurrence roll-forward behavior.

Technical Context & Constraints
- Tech stack: Next.js (app router), React 19, TypeScript, Tailwind CSS. Tests: Vitest + RTL (already in repo).
- No external UI component libraries for general UI. Small utility libraries for date handling (date-fns) are acceptable if needed for correctness, but plan a compact dependency (or implement small roll-forward helpers if you prefer zero deps).
- Persistence: local-first (localStorage) for v1. Design a persistence adapter to allow swap to server-backed storage later.
- Accessibility: keyboard-operable list/item controls, ARIA for dialogs and drag handles. Drag-and-drop must offer keyboard reordering controls (move up/down) as a fallback.

High-level architecture

- UI Layer (React components)
  - Page: /app/lists/[listId]/page.tsx — list view with tasks
  - Component: ListSidebar — manage lists, create/delete list
  - Component: ListView — renders ordered tasks for a list, handles drag-and-drop
  - Component: TaskCard — compact card with title, due date, subtask count, preview
  - Component: TaskEditorModal — create/edit task, subtask editor, recurrence picker
  - Component: SubtaskList — add/toggle subtasks
  - Component: RecurrencePicker — simple choice: none / daily / weekly / monthly

- Domain layer (models + logic)
  - Models: Task, Subtask, List, RecurrenceRule (TypeScript interfaces in src/shared/lib/types.ts)
  - Services: persistence adapter (localStorage and IndexedDB implementations), recurrence calculator (roll-forward logic)

- State management
  - Per-page local React state for list ordering and task collection; persist to adapter on change with debounce.
  - For cross-page state (lists index), expose a lightweight context provider (ListsProvider) that reads/writes to the adapter.

Data model (concise)
- Task: { id, listId, title, description, dueDate?: string, completed: boolean, recurrence?: { frequency: 'daily'|'weekly'|'monthly', interval?: number }, subtasks: Subtask[], updatedAt: number }
- Subtask: { id, parentId, title, completed }
- List: { id, name, order: number }

Drag-and-drop details (MVP)
- Use native HTML5 drag events on TaskCard rows for reordering within a list and moving across lists.
- On drag start: set dataTransfer with source listId and taskId; set dragging CSS class.
- On drag over: compute destination index by measuring mouse position relative to list children; show visual insertion indicator.
- On drop: update local ordering state (array reorder or remove/insert between lists). Persist ordering via adapter (debounced).
- Keyboard accessibility: expose up/down buttons and drag-handle with keyboard focus; support Move Up / Move Down actions.

Recurrence roll-forward behavior
- Default rule (for MVP): rolling semantics anchored to the previous instance's due date.
  - Daily: add N days; Weekly: add N * 7 days; Monthly: add 1 month using date arithmetic that preserves day-of-month where possible; if the day does not exist (e.g., 31), choose the last day of the resulting month.
- Implementation: Add a recurrenceCalculator utility with deterministic rules and unit tests covering DST and month-end cases.

Persistence & adapter
- Implement a PersistenceAdapter interface: saveLists(), saveTasks(), loadAll(), deleteTask(), updateTask(). Default implementation: localStorage with JSON; optionally provide IndexedDB using idb-keyval for larger datasets.
- On every change, write to adapter with debounce (250–500ms). Provide explicit Save/Sync UI if server sync is added later.

Testing strategy
- Unit tests (Vitest): recurrenceCalculator, persistence adapter (mocking localStorage), utility helpers, and key components' logic.
- Component tests (RTL): TaskEditorModal, TaskCard actions (open, edit, toggle complete), SubtaskList behavior.
- Integration tests: drag-and-drop ordering (simulate HTML5 events), moving a task between lists, recurrence roll-forward on completion.

Milestones & timeline (suggested small iterations)
1. Project scaffolding & models (1 day)
   - Create shared types, persistence adapter interface, recurrence calculator tests.
2. Basic list + task UI (2 days)
   - ListSidebar, ListView, TaskCard, TaskEditorModal (create/save basic task), localStorage save
3. Subtasks and recurrence UI (2 days)
   - SubtaskList, RecurrencePicker, recurrence roll-forward on complete
4. Drag-and-drop ordering (2 days)
   - Native DnD implementation + keyboard fallback + persist ordering
5. Tests & polish (2 days)
   - Add unit and integration tests, keyboard/a11y fixes, responsive design

Risk & mitigations
- Date-edge cases for monthly recurrences — mitigate by using date-fns or thorough unit tests and clear UX copy.
- Native HTML5 DnD cross-browser quirks — implement keyboard fallback and add tests; consider migrating to dnd-kit if complexity grows.
- Local storage size and concurrency — prefer IndexedDB for larger data sets and write atomic update patterns.

Artifacts produced by this plan
- Implementation plan (this document)
- tasks.md (actionable tasks) — created alongside this plan
- data-model.md and contracts/ (if we later need server APIs)

Agent notes
- This plan assumes local-first persistence and native drag-and-drop as requested. If you prefer a library-based DnD (dnd-kit) or server persistence from day one, I can update priorities and tasks accordingly.
# Implementation Plan: Task Manager Core

Feature: specs/001-task-manager-core/spec.md
Plan created: 2026-05-29
Tech stack (chosen for this implementation):
- Frontend: Next.js (app router) + React + TypeScript + Tailwind CSS
- Backend: Next.js API routes (Node.js)
- Persistence: SQLite (Prisma ORM) for server-backed storage; localStorage fallback for early development / offline
- Testing: Vitest + React Testing Library (already present)

High-level approach
- Implement a server-backed data model (SQLite via Prisma) with a local adapter layer so the UI can be developed and tested with localStorage first.
- Keep drag-and-drop ordering purely client-local state while dragging and reordering events; persist the final order to the server (or localStorage) after drop.
- Follow TDD: write unit tests first for core behaviors (task create/edit/delete, subtasks, recurring roll-forward), then integration tests for drag-and-drop and list reorder.

Artifacts produced by this plan
- Data model (Prisma schema)
- API contract docs (OpenAPI-style brief endpoints): /api/tasks, /api/lists, /api/subtasks, /api/recurrence
- React components and hooks: TaskList, TaskCard, TaskEditor, SubtaskList, useTasks (data + local ordering), Drag-and-drop adapter
- Tests: unit + integration tests under src/**/__tests__ and vitest config

Phase 0 — Setup (developer environment)
1. Add Prisma and SQLite dev deps; initialize Prisma schema and migrations.
   - npm install prisma @prisma/client --save-dev
   - npx prisma init -- Datasource set to SQLite file at prisma/dev.db
2. Add server API route scaffold under app/api/tasks/route.ts (Next.js app router API).
3. Add TypeScript types for Task, Subtask, List in src/shared/lib/types.ts (or existing types file).
4. Ensure Vitest setup includes test utils and jest-dom (already added earlier).

Phase 1 — Data model and API
1. Prisma schema (core models)
   - List { id, name, createdAt }
   - Task { id, title, description, dueDate, listId, completed, recurrenceRule, orderIndex, createdAt, updatedAt }
   - Subtask { id, parentId, title, completed, orderIndex }
2. Generate Prisma client and run initial migration.
3. Implement API routes (CRUD patterns):
   - GET /api/lists
   - POST /api/lists
   - GET /api/tasks?listId=...
   - POST /api/tasks
   - PATCH /api/tasks/:id
   - DELETE /api/tasks/:id
   - POST /api/tasks/:id/move (for reordering or moving between lists)
   - POST /api/tasks/:id/complete (handles recurrence roll-forward server side)
   - Subtasks under /api/subtasks
4. API responsibilities:
   - Validate input, return standard JSON envelope { success, data, error }
   - Compute recurrence roll-forward when a completion is requested if recurrenceRule exists.

Phase 2 — Frontend components and hooks
1. Data-layer hook: useTasks(listId)
   - Responsibilities: fetch tasks, maintain in-memory ordering state, expose actions: create, update, delete, move, complete, addSubtask, toggleSubtask.
   - Implement optimistic updates with rollback on failure.
2. Components
   - TaskList: renders a list header + TaskCard for each task. Enables drag-and-drop reordering.
   - TaskCard: compact view with title, due date badge, subtasks count, quick actions menu (use existing NoteCardActionMenu pattern as inspiration).
   - TaskEditor: modal/drawer to create/edit a task (title, plain description, due date/time, recurrence selector, subtasks management).
   - SubtaskList: small inline editor for subtasks (add, toggle, edit inline).
3. Styling: Tailwind-driven tokens; responsive layout for desktop-first design.

Drag-and-drop behavior
- Use a lightweight drag-and-drop solution (HTML5 Drag API or a small library like @dnd-kit/core). Given repo preference for minimal deps, prefer a small, dependency-free approach or dnd-kit if allowed.
- Implementation notes:
  - Reordering is maintained in `useTasks` as `orderIndex` array in local state while dragging.
  - On drop, call `moveTask({ id, toListId, toIndex })` which will update local state and then POST to /api/tasks/:id/move to persist.
  - For performance, batch order updates when multiple tasks are moved.

Recurring tasks handling
- Minimal recurrence model: frequency enum (daily, weekly, monthly) + interval integer.
- When a task with recurrence is completed:
  - Mark current instance as completed (completed=true, completedAt set)
  - Create or update the same task with dueDate advanced by recurrence interval: newDue = addInterval(task.dueDate, rule)
  - Server-side route /api/tasks/:id/complete will perform the date math using a robust date library (date-fns) to handle DST/month boundaries.
- Testing needs: unit tests validating roll-forward logic for daily/weekly and a couple of monthly edge cases (e.g., Jan 31 -> Feb 28/29 depending on rule selected).

Phase 3 — Tests (TDD)
- Unit tests:
  - useTasks hook: create/update/delete/move
  - recurrenceUtils: addInterval behavior for DST/month boundaries
  - Subtask logic: add and toggle
- Integration tests (RTL + Vitest):
  - TaskList drag-and-drop reorder and persistence
  - TaskEditor create flow
  - Recurrence completion flow

Phase 4 — Docs and Dev UX
- Quickstart in specs/001-task-manager-core/quickstart.md describing how to run migrations, start dev server, and run tests.
- API contract doc (brief) with request/response examples.

Migration and data considerations
- Provide a seed script to populate demo lists and tasks for local dev.
- Provide a migration plan if earlier data model differs — export/transform.

Risks and mitigations
- Recurrence edge cases (monthly 31st): mitigate via clear UX and tests; document behavior.
- Drag-and-drop cross-device differences: implement keyboard-accessible move controls for accessibility.
- Offline sync complexity: scope to local-first then add sync adapters later.

Timebox estimates (rough)
- Setup and DB schema: 1 day
- API routes and recurrence logic: 2 days
- Frontend list + TaskEditor + hooks: 3 days
- Drag-and-drop + ordering persistence: 2 days
- Tests: 2 days
- Docs, polish, accessibility: 1 day
Total: ~11 working days for a small team or 3-4 weeks for a single developer including review and polish.

Deliverables
- Prisma schema + next/api routes
- useTasks hook
- TaskList, TaskCard, TaskEditor components
- Unit + integration tests with Vitest
- Quickstart and API docs

Optional: local-first variant
- If you want to avoid backend work initially, implement a local adapter that persists to IndexedDB (idb-keyval) and stub API routes to use in-memory storage. This allows faster iteration with the same hooks and swap-in of server adapter later.

Next actions I can take now (pick one):
1. Create the Prisma schema + initial migration files and seed script.
2. Scaffold Next.js API routes and implement /api/tasks basic CRUD plus recurrence endpoint.
3. Start implementing the `useTasks` hook and TaskList/TaskCard components with TDD tests.

Tell me which next action to run and I'll implement it.