---
name: focused-checkpoint-commit
description: "Create a focused checkpoint commit for a completed milestone and sync current-session checkpoint log."
user-invocable: true
argument-hint: "Describe completed milestone and files to include."
---

# Focused Checkpoint Commit

Create a minimal milestone-scoped git checkpoint.

## When to Use

- After meaningful progress
- After verification passes

## Procedure

1. Confirm scope:
```bash
git status --short
```
2. Stage milestone files only:
```bash
git add <file...>
```
3. Commit with concise typed message:
```bash
git commit -m "<type>: <short milestone summary>"
```
4. Update `docs/ai/sessions/current-session.md` checkpoint log.
5. Push; if no upstream, report blocker.

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

Hard fail on unrelated staged files or missing checkpoint log update.
