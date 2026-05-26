---
name: layout-visual-iteration-loop
description: "Run a bounded CSS iteration loop using rendered screenshots, breakpoint checks, and acceptance evidence."
user-invocable: true
---

# Layout Visual Iteration Loop

Execute a deterministic, bounded render-feedback loop for CSS/layout work.

## Preconditions

- Start app in deterministic mode (stable viewport and test data)
- Define target surfaces and breakpoints before editing
- Keep loop bounded (max 3 iterations unless explicitly approved)

## Steps

1. Capture baseline screenshots for each required surface and breakpoint.
2. Apply one focused layout/style change.
3. Re-capture screenshots at the same breakpoints.
4. Run responsive and token compatibility checks.
5. Classify visual differences and decide pass/fail.
6. If fail, apply one focused fix and repeat from step 3.

## Required Evidence

- Baseline vs latest screenshot paths
- Breakpoints checked
- Specific pass/fail findings
- Final decision and unresolved risks

## Output

```text
Loop Result: pass | fail | escalate
Iterations: <count>
Baselines:
- <path>
Current:
- <path>
Findings:
- <finding>
Next Action:
- <action>
```
