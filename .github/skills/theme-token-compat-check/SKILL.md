---
name: theme-token-compat-check
description: "Verify layout/style changes remain compatible with required shared theme token contract."
user-invocable: true
---

# Theme Token Compat Check

Ensure style changes do not break theme compatibility.

## Contract Focus

- Uses required shared tokens
- Avoids hard-coded color regressions
- Preserves contrast and border/shadow semantics

## Output

```text
Compatibility: pass | fail
Violations:
- <violation>
Suggested Fixes:
- <fix>
```
