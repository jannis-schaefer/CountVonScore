---
name: completion-state-classifier
description: "Classify session/task state as complete, in-progress, or blocked based on evidence and policy."
user-invocable: true
---

# Completion State Classifier

Determine truthful completion state.

## States

- `complete`
- `in-progress`
- `blocked`

## Rules

- `complete` requires required verification + checkpoint evidence or explicitly approved exception.
- `blocked` requires blocker reason and next action.

## Output

```text
State: complete | in-progress | blocked
Evidence:
- <evidence>
Missing:
- <item>
Next Step:
- <step>
```
