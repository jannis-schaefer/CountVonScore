---
name: e2e-flake-prevention-check
description: "Check a Playwright test for common flake vectors and require deterministic setup/assertion patterns."
user-invocable: true
---

# E2E Flake Prevention Check

Evaluate test stability before acceptance.

## Checks

- Deterministic setup and reset
- No arbitrary sleeps
- Explicit assertion targets
- Stable navigation and state transitions

## Output

```text
Flake Risk: low | medium | high
Findings:
- <finding>
Fixes:
- <fix>
```
