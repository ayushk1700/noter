# Implementation Plan: Note Card Consistency And Design Baseline

**Branch**: `main` | **Date**: 2026-05-29 | **Spec**: `/specs/main/spec.md`

**Input**: Feature specification from `/specs/main/spec.md`

## Summary

Unify note-card interaction and visual behavior across canvas, grid, and media variants by introducing a shared action-menu contract and shared design tokens. The implementation will refactor duplicated card-action UI into reusable TypeScript components/utilities, add keyboard/touch-compatible interaction behavior, and define test-first validation to prevent regressions.

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: TypeScript 5.6+, React 19, Next.js 15

**Primary Dependencies**: Next.js App Router, Tailwind CSS, lucide-react, existing workspace UI components

**Storage**: N/A (frontend presentation and interaction behavior)

**Testing**: ESLint + (planned) Vitest + React Testing Library for UI behavior tests

**Target Platform**: Modern browsers (desktop + touch) in Next.js web app

**Project Type**: Web application (single Next.js project)

**Performance Goals**: Preserve current card interaction smoothness; menu interactions should not introduce visible jank during hover/drag transitions

**Constraints**: Must follow constitution (TS only, functional React only, no external UI component libraries, TDD mandatory)

**Scale/Scope**: Workspace note-card surfaces: canvas variants, grid variants, and shared note-card styling/interaction primitives

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Clean Code First: Introduce reusable menu/design primitives to replace duplicated card-specific action blocks.
- [x] TypeScript Required: All implementation targets are `.tsx`/`.ts` files.
- [x] TDD Mandatory: Plan includes test-first tasks for menu behavior, accessibility, and event-isolation regressions.
- [x] Functional React Only: Changes remain in function components with hooks.
- [x] No External UI Libraries: Uses existing Tailwind + local components only.

**Post-Design Re-check**: PASS. Phase 1 artifacts keep all five gates satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/main/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── note-card-ui-contract.md
└── tasks.md
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
src/
├── app/
├── features/
│   └── workspace/
│       └── components/
├── shared/
│   ├── components/
│   ├── lib/
│   └── styles/
└── ...

tests/ (to be created)
├── unit/
└── integration/
```

**Structure Decision**: Use the existing single Next.js app structure. Refactor workspace note-card UI in `src/features/workspace/components`, introduce shared note-card design primitives under `src/shared`, and add frontend tests under a new `tests/` tree.

## Implementation File Impact

### Existing files to modify

- `src/features/workspace/components/NoteNode.tsx`
- `src/features/workspace/components/WorkspaceView.tsx`
- `src/features/workspace/components/ZenCanvasNoteCard.tsx`
- `src/app/globals.css` (or shared style entry for token usage)
- `package.json` (add test scripts/dependencies for mandatory TDD)

### New files to create

- `src/shared/components/NoteCardActionMenu.tsx` (single reusable action-menu UI)
- `src/shared/lib/noteCardActions.ts` (typed action config + shared behavior)
- `src/shared/styles/noteCardDesign.ts` (design tokens/rules for note cards)
- `tests/unit/note-card-action-menu.test.tsx` (menu rendering + interaction)
- `tests/integration/note-card-consistency.test.tsx` (cross-variant consistency)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No constitution violations expected.
