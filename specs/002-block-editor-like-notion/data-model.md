# Data Model: Block Editor Like Notion

## Page

Represents a single editable document.

Fields:
- `id`: string
- `title`: string
- `blocks`: ordered collection of top-level block IDs
- `updatedAt`: number

Relationships:
- A page contains many blocks
- The page stores the canonical ordering of top-level blocks

## Block

Represents a single unit of content in the editor.

Fields:
- `id`: string
- `pageId`: string
- `type`: text, heading, listItem, quote, callout, divider, or code
- `content`: string
- `parentId`: string | null
- `children`: ordered collection of child block IDs
- `order`: number
- `isCollapsed`: boolean
- `updatedAt`: number

Relationships:
- A block belongs to exactly one page
- A block may have zero or one parent block
- A block may own child blocks, but only one nesting level is allowed in v1

Validation rules:
- `content` may be empty, but the editor must preserve an editable block
- A block cannot become its own parent
- A block cannot create a nesting loop
- Child blocks must remain one level deep only
- Divider blocks do not hold text content

## BlockCommand

Represents a slash-command or keyboard transform action.

Fields:
- `id`: string
- `label`: string
- `description`: string
- `targetType`: string
- `shortcut`: string | null

Validation rules:
- Commands must map to supported block types or supported transform actions
- A command must have a stable label and deterministic effect

## BlockTreeState

Represents the current editable order and nesting state for a page.

Fields:
- `pageId`: string
- `blockIds`: ordered collection of top-level block IDs
- `blockMap`: map of block ID to Block
- `saveStatus`: idle, saving, saved, or error

State transitions:
- `idle` -> `saving` when the user changes block content or structure
- `saving` -> `saved` when persistence succeeds
- `saving` -> `error` when persistence fails
- `error` -> `saving` when a retry occurs
