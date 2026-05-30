<!--
Sync Impact Report
- Version change: template -> 1.0.0
- Modified principles:
	- [PRINCIPLE_1_NAME] -> I. Clean Code First
	- [PRINCIPLE_2_NAME] -> II. TypeScript Is Required
	- [PRINCIPLE_3_NAME] -> III. Test-Driven Development Is Mandatory
	- [PRINCIPLE_4_NAME] -> IV. Functional React Components Only
	- [PRINCIPLE_5_NAME] -> V. No External UI Component Libraries
- Added sections:
	- Technical Standards
	- Workflow & Quality Gates
- Removed sections:
	- None
- Templates requiring updates:
	- ✅ updated: .specify/templates/plan-template.md
	- ✅ updated: .specify/templates/spec-template.md
	- ✅ updated: .specify/templates/tasks-template.md
	- ✅ reviewed (not present): .specify/templates/commands/*.md
- Runtime guidance updates:
	- ✅ updated: README.md
- Follow-up TODOs:
	- None
-->

# Noter Constitution

## Core Principles

### I. Clean Code First
All code changes MUST optimize for readability, maintainability, and small composable units.
Functions and components MUST have one clear purpose, and naming MUST be explicit and
domain-relevant. Dead code, commented-out logic, and large unstructured files are not
permitted in merged changes. Rationale: maintainable code reduces defects and onboarding
time while improving delivery speed.

### II. TypeScript Is Required
All application code in this repository MUST be written in TypeScript. New JavaScript source
files are not allowed unless they are build tooling scripts that cannot be represented in
TypeScript. Strict typing MUST be preserved for exported APIs, component props, and shared
domain models. Usage of `any` MUST be justified in the PR and localized to the smallest safe
scope. Rationale: strong typing prevents regressions and clarifies contracts.

### III. Test-Driven Development Is Mandatory
Every behavior change MUST follow TDD: write tests first, confirm failing tests, implement
the minimal code to pass, then refactor with tests green. No feature is complete without test
evidence that demonstrates the red-green-refactor cycle. Skipping tests is not allowed.
Rationale: TDD ensures correctness and supports safe refactoring over time.

### IV. Functional React Components Only
React UI implementation MUST use functional components and hooks. Class components are not
allowed for new code. Shared logic MUST be extracted to hooks or pure utilities when a
component exceeds clear presentational responsibility. Rationale: this standard keeps UI code
consistent and composable across the codebase.

### V. No External UI Component Libraries
Teams MUST NOT add third-party UI component libraries (for example, Material UI, Chakra,
Ant Design, Mantine, shadcn-style dependency packages). Styling and components MUST be built
using existing project primitives (Tailwind, local components, and utility patterns). Icon-only
packages and animation libraries are allowed when they do not provide full UI component suites.
Rationale: avoiding UI framework sprawl preserves design consistency and keeps bundle/control
cost predictable.

## Technical Standards

- Runtime application code MUST remain TypeScript-first across frontend and API routes.
- UI code MUST be implemented as functional React components with typed props.
- Shared types MUST live in centralized type modules and be reused rather than duplicated.
- New dependencies MUST be justified for scope, maintenance, and bundle impact.
- Any proposed UI toolkit addition MUST be rejected unless this constitution is amended first.

## Workflow & Quality Gates

- Planning gate: every plan MUST include an explicit Constitution Check against all five core
	principles.
- Delivery gate: every implementation PR MUST include failing-then-passing test evidence for
	changed behavior.
- Review gate: code review MUST reject changes that violate TypeScript requirements, introduce
	class components, or add external UI component libraries.
- Merge gate: CI/lint/test checks MUST pass before merge.

## Governance

This constitution overrides lower-level process documents where conflicts exist.

Amendment process:
- Propose changes in a PR that includes rationale, impacted principles, and migration guidance.
- Obtain explicit maintainer approval before merge.
- Update dependent templates and runtime guidance in the same change.

Versioning policy:
- MAJOR: incompatible removals/redefinitions of principles or governance guarantees.
- MINOR: new principle/section or materially expanded mandatory guidance.
- PATCH: wording clarifications, typo fixes, and non-semantic edits.

Compliance review expectations:
- Every plan, spec, and tasks artifact MUST be checked against this constitution.
- Every PR review MUST include a constitution compliance check.
- Violations MUST be fixed before merge or blocked pending formal amendment.

**Version**: 1.0.0 | **Ratified**: 2026-05-29 | **Last Amended**: 2026-05-29
