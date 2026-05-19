---
name: focused-checkpoint-commit
description: "Create a focused checkpoint commit for a completed milestone and sync current-session checkpoint log."
user-invocable: true
argument-hint: "Describe completed milestone and files to include."
---

# Focused Checkpoint Commit

Create a minimal, milestone-scoped git checkpoint.

## When to Use

- After a meaningful completed step
- After verification passes for that step
- Before switching task scope

## Procedure

1. Confirm intended files only:
```bash
git status --short
```
2. Stage only milestone files:
```bash
git add <file...>
```
3. Commit with concise typed message:
```bash
git commit -m "<type>: <short milestone summary>"
```
4. Update `docs/ai/sessions/current-session.md` checkpoint log.
5. Commit checkpoint log update if needed.
6. Push; if no upstream, report blocker and continue local commits.

## Output Format

```text
Checkpoint Intent:
- <summary>

Files Staged:
- <path>

Commit:
- <hash> <message>

Push:
- success | blocked-no-upstream | failed

Checkpoint Log:
- updated | not-updated (reason)
```

## Hard-Fail Conditions

- Staging unrelated files without explicit approval
- Skipping checkpoint log update when milestone commit was created
