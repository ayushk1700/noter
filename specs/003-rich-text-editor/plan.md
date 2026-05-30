# Implementation Plan: Rich Text Editor

**Feature**: Rich Text Editor
**Spec**: spec.md
**Created**: 2026-05-30
**Branch**: master

## Technical Context

- Purpose: Provide a rich-text editing experience inside notes supporting Bold, Italic, Underline, Strikethrough, H1/H2/H3, Bullet list, Numbered list, Checklist, Quote, Divider, Code block, Inline code.
- Existing codebase: Next.js app with local-first persistence (IDB/localStorage). There is an existing editor integration used elsewhere in the repo.
- Unknowns / NEEDS CLARIFICATION: None identified in the spec after review.

## Constitution Check

Evaluate the plan against the Noter Constitution (excerpt):

- I. Clean Code First — PASS: plan uses small, testable artifacts and TDD approach enforced in requirements.
- II. TypeScript Is Required — PASS: implementation artifacts will be TypeScript-first.
- III. Test-Driven Development Is Mandatory — PASS: tests required before implementation in spec.
- IV. Functional React Components Only — PASS: UI will use functional components and hooks.
- V. No External UI Component Libraries — PASS: plan forbids adding external UI component libraries; icon-only packages allowed.

No gates are violated. Continue to Phase 0.

## Phase 0: Outline & Research

1. Extract unknowns from Technical Context: none.
2. Research tasks: none required — proceed to design.
3. Consolidate findings: created research.md (empty decisions section because no open questions).

Output: research.md

## Phase 1: Design & Contracts

Prerequisite: research.md complete

1. Data model (data-model.md): define the Document model, ChecklistItem entity, and persistence contract.
2. Contract(s) (/contracts): define the public contract for editor serialization (editor-document-contract.md).
3. Quickstart (quickstart.md): short developer instructions to get the editor running and toggling features.
4. Agent context update: update .github/copilot-instructions.md to reference this plan (done).

Output: data-model.md, /contracts/editor-document-contract.md, quickstart.md

## Tasks (High Level)

- P0-001: Research paste sanitization best practices (assigned to Phase 0 but marked complete — no open unknowns).
- P1-001: Define Document JSON model and serialization format (data-model.md).
- P1-002: Define editor-document contract and examples (/contracts/editor-document-contract.md).
- P1-003: Create unit tests for serialization round-trip and checklist toggles.
- P1-004: Implement editor React component shell and toolbar with keyboard shortcuts.
- P1-005: Implement formatting commands and document model mutations (TDD-first).
- P1-006: Implement paste sanitization and import mapping.
- P1-007: Persistence integration: adapter glue to existing local-first persistence.
- P1-008: Accessibility audit and keyboard shortcut support.
- P1-009: Integration tests for saving/loading, and UI smoke tests.

## Phase 2: Implementation

- Break P1 tasks into smaller tasks in tasks.md when moving to implementation.

---

**Generated artifacts**:
- specs/003-rich-text-editor/plan.md
- specs/003-rich-text-editor/research.md
- specs/003-rich-text-editor/data-model.md
- specs/003-rich-text-editor/quickstart.md
- specs/003-rich-text-editor/contracts/editor-document-contract.md

