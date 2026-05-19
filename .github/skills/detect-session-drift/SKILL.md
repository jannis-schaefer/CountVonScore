---
name: detect-session-drift
description: "Detect mismatch between intended plan/session scope and current branch/worktree state."
user-invocable: true
---

# Detect Session Drift

Compare current execution state against intended scope.

## Checks

- Active step vs changed files
- Branch naming vs session intent
- Checkpoint log vs actual commits
- Blockers documented vs blockers observed

## Output

```text
Drift: none | minor | major
Findings:
- <finding>
Correction:
- <action>
```
