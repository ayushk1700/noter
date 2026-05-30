# Data Model: Note Card Consistency And Design Baseline

## Entity: NoteCardDisplayState

**Purpose**: Normalized presentation/interaction state for each note-card variant.

**Fields**:
- `noteId: string`
- `variant: 'canvas' | 'grid' | 'media'`
- `isHovered: boolean`
- `isFocused: boolean`
- `isMenuOpen: boolean`
- `isDragging: boolean`
- `isResizing: boolean`

**Validation rules**:
- `noteId` must reference an existing note.
- `variant` must be one of the allowed enum values.
- `isMenuOpen` must be false when `isDragging` or `isResizing` is true.

## Entity: NoteCardActionMenuModel

**Purpose**: Shared menu contract for all note-card action surfaces.

**Fields**:
- `actions: NoteCardAction[]`
- `triggerLabel: string`
- `openOnHover: boolean`
- `openOnFocus: boolean`
- `openOnTap: boolean`

**Validation rules**:
- Required actions: `pinToggle`, `duplicate`, `copyLink`, `delete`.
- Trigger must be keyboard focusable.
- Destructive action (`delete`) must be visually distinct.

## Entity: NoteCardDesignTokenSet

**Purpose**: Reusable design baseline for note-card shell and action menu.

**Fields**:
- `cardRadius: string`
- `cardPadding: string`
- `menuRadius: string`
- `menuGap: string`
- `triggerSize: string`
- `menuTransition: string`

**Validation rules**:
- Tokens must be consumed by all card variants.
- No variant-specific hardcoded replacements for shared token values unless explicitly documented.

## Relationships

- `NoteCardDisplayState` uses `NoteCardActionMenuModel` for actions visibility and interaction mode.
- `NoteCardActionMenuModel` uses `NoteCardDesignTokenSet` for visual consistency.

## State Transitions

1. `idle -> hovered` on pointer enter.
2. `hovered -> menuOpen` on trigger hover/focus/tap.
3. `menuOpen -> idle` on pointer leave/blur/escape.
4. `menuOpen -> actionExecuting` on action click.
5. `actionExecuting -> idle` after handler completion.
6. `hovered/menuOpen -> dragging` when drag starts; menu must close.