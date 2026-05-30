# Quickstart: Block Editor Like Notion

## What this feature provides

A Notion-like block editor with keyboard-first block creation, slash commands, block reordering, one-level nesting, and local persistence.

## What to build first

1. Add the block domain types and tree helpers.
2. Add tests for split, transform, move, indent, and outdent operations.
3. Add the editor shell and render a simple block list.
4. Add the slash command menu and save-state indicator.
5. Add drag-and-drop and keyboard reordering.

## Local development flow

- Run the application in the existing Next.js app.
- Open the block editor route or page once the editor shell is connected.
- Verify that block edits update the save indicator.
- Refresh the page to confirm persistence.

## Test flow

1. Write failing tests for block operations.
2. Implement the minimum code needed to pass.
3. Refactor while keeping tests green.
4. Add integration tests for nesting and drag-and-drop ordering.

## Manual verification checklist

- Create a new block and continue typing.
- Split a block into two blocks with keyboard input.
- Change a block type through the command menu.
- Drag a block to a new position.
- Nest a block under a parent and move it back out.
- Refresh and confirm the structure restores.

## Notes

- This feature is intentionally local-first in v1.
- No external UI component libraries are required.
- One-level nesting is the maximum supported depth in v1.
