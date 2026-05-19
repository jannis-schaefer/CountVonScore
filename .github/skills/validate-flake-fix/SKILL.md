---
name: validate-flake-fix
description: "Validate a flake fix with repeat runs and residual-risk scoring before acceptance."
user-invocable: true
---

# Validate Flake Fix

Confirm whether a proposed flake fix is reliable enough to accept.

## Procedure

1. Run targeted test repeatedly.
2. Compare pre/post failure pattern.
3. Report residual risk.

## Output

```text
Result: accept-fix | reject-fix
Runs: <count>
Failures: <count>
Residual Risk: low | medium | high
```
