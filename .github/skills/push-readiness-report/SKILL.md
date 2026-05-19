---
name: push-readiness-report
description: "Report whether push is ready, blocked by missing upstream, or blocked by verification failures."
user-invocable: true
---

# Push Readiness Report

Provide clear push readiness classification.

## States

- `ready`
- `blocked-no-upstream`
- `blocked-verification`
- `blocked-other`

## Output

```text
Push State: <state>
Reason:
- <reason>
Next Step:
- <step>
```
