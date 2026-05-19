---
name: required-checks-alignment
description: "Confirm required checks in workflow and branch policy align with current quality gate expectations."
user-invocable: true
---

# Required Checks Alignment

Verify required check naming and scope alignment.

## Checks

- Workflow job names and required check references
- Required E2E scope vs optional regression scope
- Verify gate expectations in docs vs workflow

## Output

```text
Alignment: pass | fail
Mismatched Checks:
- <item>
Fixes:
- <change>
```
