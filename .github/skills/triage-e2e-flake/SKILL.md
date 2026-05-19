---
name: triage-e2e-flake
description: "Diagnose flaky Playwright failures using failure evidence, repetition patterns, and probable root-cause classification."
user-invocable: true
argument-hint: "Provide failing test name, error output, and recent run context."
---

# Triage E2E Flake

Classify why an E2E test is flaky and identify the most likely root cause.

## Procedure

1. Gather failure signatures and affected test steps.
2. Classify likely cause:
- Selector instability
- Timing/race condition
- State leakage
- Environment/resource variance
3. Return confidence and immediate next probe.

## Output

```text
Flake Classification: <type>
Confidence: low | medium | high
Evidence:
- <item>
Next Probe:
- <step>
```
