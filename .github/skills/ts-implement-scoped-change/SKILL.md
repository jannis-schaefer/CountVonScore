---
name: ts-implement-scoped-change
description: "Implement a tightly scoped TypeScript/React change in app paths only, with minimal diff and risk notes."
user-invocable: true
argument-hint: "Describe scope and target files under src/."
---

# TS Implement Scoped Change

Implement minimal app logic/component changes under `src/**`.

## Hard Rules

- Do not edit `e2e/**`.
- Keep public APIs stable unless requested.
- Include changed file list and risk notes.

## Output

- Scope implemented
- Files changed
- Risks
- Suggested verification command
