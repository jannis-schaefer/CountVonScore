---
name: ts-impact-scan
description: "Scan likely impact surfaces for a planned TypeScript change before editing."
user-invocable: true
---

# TS Impact Scan

Identify dependencies and blast radius before implementation.

## Checks

- Imports/exports touched
- Store/state consumers
- Component props and callers
- Types shared across modules

## Output

```text
Impact Summary:
- <item>
High-Risk Areas:
- <path>
Suggested Safe Order:
1. <step>
2. <step>
```
