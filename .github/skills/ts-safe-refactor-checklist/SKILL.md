---
name: ts-safe-refactor-checklist
description: "Run a strict checklist to ensure a TypeScript refactor did not cause behavior drift or domain spillover."
user-invocable: true
---

# TS Safe Refactor Checklist

Use after TS edits, before acceptance.

## Checklist

- [ ] Scope stayed within `src/**`
- [ ] No unintended API surface change
- [ ] No e2e file edits
- [ ] Types remain consistent
- [ ] Follow-up verification command identified

## Output

`pass` or `fail` with failed checklist items.
