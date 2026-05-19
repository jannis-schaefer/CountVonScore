---
name: propose-e2e-stabilization-plan
description: "Propose a deterministic stabilization plan for flaky E2E tests with minimal behavior-impacting changes."
user-invocable: true
---

# Propose E2E Stabilization Plan

Convert flake diagnosis into an ordered stabilization plan.

## Plan Requirements

- Keep behavior checks intact
- Prefer locator and synchronization fixes over sleeps
- Include rollback path if fix worsens reliability

## Output

```text
Plan:
1. <fix>
2. <fix>
Expected Reliability Gain:
- <estimate>
Risks:
- <risk>
```
