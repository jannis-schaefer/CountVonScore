---
name: e2e-suite-placement
description: "Decide whether a Playwright scenario belongs in required or optional regression suites with explicit rationale."
user-invocable: true
---

# E2E Suite Placement

Place new E2E scenarios in the correct suite.

## Rules

- Required suite: critical release-gate behavior
- Optional regression: exploratory, costly, or less-critical cases

## Output

```text
Scenario: <name>
Placement: required | optional-regression
Rationale:
- <reason>
```
