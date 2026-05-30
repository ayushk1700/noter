# Contract: Note Card Action Menu Consistency

## Scope

Applies to all note-card variants in workspace surfaces:
- Canvas note cards
- Grid note cards
- Standalone media note cards

## Required Interaction Contract

1. Each card variant MUST render a 3-dot trigger in the header action zone.
2. Trigger visibility MUST support:
   - Pointer hover (desktop)
   - Focus interaction (keyboard)
   - Tap/click (touch)
3. Opening the trigger MUST reveal the same action set:
   - Pin/Unpin
   - Duplicate
   - Copy Link
   - Delete
4. Action selection MUST NOT bubble to card open/navigation handlers.
5. Menu MUST close on blur, pointer leave, Escape key, or action completion.

## Visual Contract

1. Action pill style (background, border, spacing, transition) MUST be shared.
2. Trigger icon size and touch target MUST be shared.
3. Delete action MUST use destructive color treatment distinct from neutral actions.

## Accessibility Contract

1. Trigger MUST be keyboard focusable.
2. Trigger MUST include accessible label/title.
3. Actions MUST be reachable by keyboard.

## Security/Safety Contract

1. Menu action handlers MUST stop propagation to parent card click handlers.
2. Copy-link action MUST only expose note link format already supported by app.
3. No action handler may execute HTML from note content.