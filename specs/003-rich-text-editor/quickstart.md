# quickstart.md

## Quickstart: Rich Text Editor (developer)

1. Open the codebase and locate `src/features/editor`.
2. Create the editor component at `src/features/editor/components/RichTextEditor.tsx`.
3. Implement the document model serialization using `specs/003-rich-text-editor/data-model.md`.
4. Add unit tests under `src/features/editor/__tests__/` that assert serialization round-trip and checklist toggles.
5. Wire persistence to existing adapters (IDB/localStorage) used by the app.

Run tests:

```bash
npm run test src/features/editor
```

