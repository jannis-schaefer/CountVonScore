---
name: classify-gate-failures
description: "Classify failed quality gates by likely ownership and propose minimal recovery sequence."
user-invocable: true
---

# Classify Gate Failures

Map gate failures to owners and actions.

## Owners

- TypeScriptImplementer
- E2EImplementer
- QualityGateRunner
- CI/config owner

## Output

```text
Failure:
- <gate>: <summary>
Likely Owner:
- <owner>
Recovery Steps:
1. <step>
2. <step>
```
