# Implementation Plan: Block Editor Like Notion

**Feature**: `specs/002-block-editor-like-notion/spec.md`
**Plan Date**: 2026-05-29
**Status**: Draft

## Technical Context

- **Target app**: Existing Next.js application in this workspace
- **Language**: TypeScript only
- **UI**: Functional React components only
- **Styling**: Tailwind CSS and existing local primitives only
- **Persistence**: Local-first persistence for editor state and block tree
- **Testing**: Vitest + React Testing Library with TDD workflow

## Constitution Check

### I. Clean Code First
- Plan uses small, composable blocks: editor shell, block tree model, command menu, drag handles, and persistence adapter.
- Block behavior is decomposed into utilities and hooks instead of a monolithic editor component.
- Status: PASS

### II. TypeScript Is Required
- All proposed implementation surfaces are TypeScript-first.
- Shared domain models will be centralized and reused across editor components and hooks.
- Status: PASS

### III. Test-Driven Development Is Mandatory
- Plan starts with utility and behavior tests for block transforms, nesting, command parsing, and persistence.
- UI work will follow red-green-refactor cycles with RTL tests before implementation changes.
- Status: PASS

### IV. Functional React Components Only
- All UI work is planned as functional components and hooks.
- No class components are introduced in any phase.
- Status: PASS

### V. No External UI Component Libraries
- The editor will use existing local components, Tailwind classes, and lightweight utilities only.
- No UI framework dependency is introduced for command menus, dialogs, or drag handles.
- Status: PASS

## Goals

Build a Notion-like block editor that supports:
- block-based editing with keyboard-first creation
- slash-command style block insertion and transforms
- block reordering via drag-and-drop
- one-level nesting for child blocks
- reliable persistence of page structure and content
- save-state feedback so the editor feels trustworthy

## Non-Goals

- Rich text formatting beyond the block-level behaviors in the spec
- Multiplayer collaboration or live cursors
- Database query features or linked databases
- External UI component libraries
- Multi-level nesting beyond one parent-child layer in v1

## Proposed Architecture

### 1. Editor Shell
A page-level editor container will own the document state, current selection context, and persistence lifecycle.

Responsibilities:
- render the current page and its block tree
- coordinate editing events, slash commands, and save state
- pass typed callbacks into block components

### 2. Block Tree Model
Represent the page as a normalized tree or ordered list with parent references.

Core fields:
- `id`
- `type`
- `content`
- `children`
- `parentId`
- `order`
- `isCollapsed`
- `updatedAt`

### 3. Block Renderer Layer
Render each block type through a focused component, such as:
- text
- heading
- list item
- quote
- callout
- divider
- code
- child block container

### 4. Command System
Provide a slash command menu and keyboard transforms for common block types.

Responsibilities:
- detect `/` command trigger
- filter common block options
- apply transforms to the current block
- insert a new block from a command selection

### 5. Reordering and Nesting
Use drag-and-drop plus keyboard fallback actions to move blocks.

Responsibilities:
- reorder blocks vertically
- indent/outdent one level for nesting
- prevent invalid parent-child loops
- preserve ordering in persisted state

### 6. Persistence Adapter
Implement local persistence behind a typed adapter.

Responsibilities:
- load page state on startup
- save block tree changes after edits
- expose a stable interface for later sync if needed

## Data Model

### Page
- `id`: string
- `title`: string
- `blocks`: Block[]
- `updatedAt`: number

### Block
- `id`: string
- `type`: `'text' | 'heading' | 'listItem' | 'quote' | 'callout' | 'divider' | 'code'`
- `content`: string
- `parentId`: string | null
- `children`: string[]
- `order`: number
- `isCollapsed`: boolean
- `updatedAt`: number

### BlockCommand
- `id`: string
- `label`: string
- `description`: string
- `type`: matching block type or transform action
- `shortcut`: optional text shortcut

## Phase 0: Research & Clarification Resolution

Resolved assumptions for this plan:
- Persistence will be local-first in the current application.
- One-level nesting is sufficient for v1, matching the spec assumptions.
- Slash commands will cover the most common block types first.

## Phase 1: Foundation

1. Add shared block domain types and helper utilities.
2. Add block tree operations:
   - create block
   - split block
   - transform block type
   - move block
   - indent/outdent block
   - normalize tree ordering
3. Add a persistence adapter for loading and saving the editor state.
4. Add tests for each utility before wiring the UI.

## Phase 2: Editor UI

1. Build the editor shell page and page-level state provider.
2. Render the block tree with functional components.
3. Add inline editable block rows with keyboard navigation.
4. Add an empty-state block to bootstrap the first entry.
5. Add save-state indicator UI.

## Phase 3: Commands and Keyboard UX

1. Build the slash command menu.
2. Support keyboard transforms for the common block types.
3. Add keyboard-only block insertion, split, indent, and outdent actions.
4. Add tests for command filtering and selection behavior.

## Phase 4: Drag-and-Drop and Nesting

1. Add drag handles and reorder interaction.
2. Implement drop targets for between-block placement.
3. Support one-level nesting with indent/outdent actions.
4. Prevent invalid moves and confirm structure persists.

## Phase 5: Persistence, Save State, and Polish

1. Persist the page state after edits and reorder operations.
2. Show clear saving / saved / error states.
3. Harden empty blocks, paste splitting, and parent deletion behavior.
4. Add accessibility tests and final RTL coverage.

## Testing Strategy

### Unit Tests
- block tree operations
- command parsing and transform application
- persistence adapter load/save behavior
- save-state transitions

### Component Tests
- editor shell renders initial content
- slash command menu opens and applies a block type
- block row edit, split, and keyboard movement behaviors
- save-state indicator updates after edits

### Integration Tests
- reorder blocks with drag-and-drop
- nest and unnest one-level children
- reload and verify persisted structure restores exactly

## Risks and Mitigations

- **Risk**: drag-and-drop can become fragile across browsers.
  - **Mitigation**: keep keyboard reorder actions as a first-class fallback.
- **Risk**: tree mutations can create invalid parent-child states.
  - **Mitigation**: normalize structure through pure helper functions and test them first.
- **Risk**: the command system can drift from the block model.
  - **Mitigation**: define commands as typed data that map directly to block operations.

## Delivery Notes

- The implementation must be TDD-first.
- The plan intentionally avoids external UI component libraries.
- The plan is scoped to a single-editor experience and does not introduce collaboration or database features.

## Next Artifacts

- `specs/002-block-editor-like-notion/data-model.md`
- `specs/002-block-editor-like-notion/quickstart.md`
- Optional `contracts/` directory is not required because this feature does not expose an external API in v1.
