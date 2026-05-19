---
name: ci-gate-policy-review
description: "Review CI gate definitions and ensure required/optional checks match repository policy."
user-invocable: true
---

# CI Gate Policy Review

Assess whether CI gates align with intended release policy.

## Checks

- Required vs optional checks
- Release branch behavior
- Manual dispatch behavior for optional flows

## Output

```text
Policy Alignment: pass | fail
Mismatches:
- <mismatch>
Recommended Updates:
- <change>
```
