# Feature Specification: Task Manager Core

**Feature Branch**: `001-task-manager-core`

**Created**: 2026-05-29

**Status**: Draft

**Input**: User description: "Build a task management application featuring Core Task Management (titles, plain-text descriptions, due dates/times, 1-layer deep subtasks, multiple distinct lists, and recurring tasks handled by rolling dates forward). Include manual drag-and-drop organization. Intentionally omit priority tags, rich text, and list sharing"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and manage tasks (Priority: P1)

As a user I want to create tasks with a title, a plain-text description and a due date/time so I can track work I must do.

**Why this priority**: Core value - without creating tasks the product has no utility.

**Independent Test**: Create a new task, verify it appears in the selected list, open it to view/edit title, description and due date/time, then save and confirm changes persist.

**Acceptance Scenarios**:

1. Given I am on a specific list, When I click New Task and enter title + optional description + due date, Then the task appears at the top of the list with the entered values.
2. Given a saved task, When I open it, Then I can edit title, description, due date/time and save changes which persist.

---

### User Story 2 - Subtasks (Priority: P1)

As a user I want to add one layer of subtasks beneath a task so I can break work into small actionable items.

**Why this priority**: Subtasks provide common structure for practical task workflows while keeping data model simple.

**Independent Test**: Create a task, add 1–5 subtasks, toggle each subtask complete/incomplete, and confirm counts and UI reflect state.

**Acceptance Scenarios**:

1. Given a parent task, When I add a subtask, Then the subtask appears under the parent and is editable.
2. Given subtasks exist, When I mark a subtask complete, Then the parent shows completed-subtasks count and state does not automatically delete subtasks.

---

### User Story 3 - Multiple lists and drag-and-drop organization (Priority: P1)

As a user I want multiple distinct lists (e.g., Inbox, Today, Project A) and be able to drag tasks between lists and reorder tasks inside a list.

**Why this priority**: Organization across lists is the main interaction for managing work.

**Independent Test**: Create two lists, create tasks in List A, drag a task to List B, and verify it appears in List B and is removed from List A. Reorder two tasks within a list and confirm order persists.

**Acceptance Scenarios**:

1. Given two lists exist, When I drag a task from List A into List B, Then the task now belongs to List B and displays under that list.
2. Given multiple tasks in a list, When I drag to reorder, Then the new order is saved and visible after a reload.

---

### User Story 4 - Recurring tasks with rolling dates (Priority: P2)

As a user I want a simple recurrence option so a task can reappear after completion by rolling its due date forward by the recurrence interval (e.g., daily, weekly).

**Why this priority**: Recurrence is common and useful but can be scoped small: simple roll-forward on completion.

**Independent Test**: Create a daily recurring task. Mark it complete; confirm the existing instance is recorded as completed and a new instance is created/set with a due date advanced by 1 day.

**Acceptance Scenarios**:

1. Given a task with recurrence set, When I mark the task complete, Then the system creates the next instance by moving the due date forward according to the recurrence rule.
2. Given a recurring task overdue, When I complete it, Then the next due date is calculated from the completed instance's original due date (not from current time).

---

### Edge Cases

- Rolling recurrence across DST and month boundaries (e.g., "monthly on the 31st") should choose a sensible rule (e.g., last day of month) — see [NEEDS CLARIFICATION: recurrence rule edge behavior].
- What happens when a user deletes a list containing recurring tasks? (assume tasks are deleted with the list unless moved first).
- Subtask limits: UI should support reasonable numbers (e.g., 0–50) without performance regressions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow creation of tasks with: title (required), plain-text description (optional), optional due date/time, and belonging to a single list.
- **FR-002**: The system MUST allow creation of one-layer subtasks attached to a parent task. Subtasks have title and boolean complete state.
- **FR-003**: The system MUST display tasks grouped by list and support manual drag-and-drop to reorder tasks and move them between lists.
- **FR-004**: The system MUST support simple recurring tasks with a recurrence frequency (daily, weekly, monthly) where completion rolls the task’s due date forward.
- **FR-005**: The system MUST persist tasks, subtasks, and list membership so changes survive a page reload.
- **FR-006**: The system MUST provide a responsive UI and ensure changes are reliably saved (user sees feedback that save succeeded or failed).
- **FR-007**: UI interactions MUST be keyboard accessible (tab navigation + Enter/Space actionable) and provide ARIA labels for key controls.
- **FR-008**: Tests MUST be authored prior to implementation for new behavior (TDD workflow) and accompany each functional requirement.
- **FR-009**: The system MUST NOT include priority tags, rich-text content, or list-sharing features in v1 (explicitly out of scope).

[NEEDS CLARIFICATION: persistence target — local-only (browser storage) or server-backed API?]

### Key Entities

- **Task**: id, title, description (plain text), dueDate (nullable, ISO 8601), listId, completed (boolean), recurrenceRule (nullable), subtasks[]
- **Subtask**: id, parentTaskId, title, completed (boolean)
- **List**: id, name, ordering metadata
- **RecurrenceRule**: frequency enum (daily|weekly|monthly), interval (integer), optional anchor behavior

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create and save a new task with title + optional description + due date within 30 seconds (measured in user test).
- **SC-002**: Users can add and toggle at least one subtask and observe correct completed-subtask counts 100% of attempts in automated tests.
- **SC-003**: Dragging and dropping tasks between lists succeeds on first attempt in 95% of automated UI drag simulations.
- **SC-004**: Recurring tasks roll forward correctly in automated tests for daily and weekly frequencies (monthly edge cases require clarifications).
- **SC-005**: End-to-end persistence test shows tasks survive a simulated reload (local or server, per clarified persistence target).

## Assumptions

- Mobile support is considered but the primary UI target is web desktop for v1.
- Authentication and multi-user syncing are out of scope for this feature unless persistence clarification requests server-backed storage.
- Data retention defaults to user-controlled deletion; auto-purging is out of scope.
- By default we assume server-backed persistence will be available later; for early development a local-storage-backed adapter is acceptable.



---

**Spec Status**: Ready for planning with up to 3 clarifying questions.
