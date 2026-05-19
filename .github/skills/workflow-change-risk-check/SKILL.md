---
name: workflow-change-risk-check
description: "Evaluate risk of CI workflow changes before acceptance, including reliability, cost, and false-failure impact."
user-invocable: true
---

# Workflow Change Risk Check

Score risk from workflow edits.

## Risk Areas

- Reliability regression
- Runtime/cost increase
- Overly strict or overly lax gating

## Output

```text
Risk Level: low | medium | high
Findings:
- <finding>
Mitigation:
- <action>
```
