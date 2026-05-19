---
name: promote-draft-regression-case
description: "Promote exactly one drafted E2E regression scenario into an active test with deterministic assertions and stable selector strategy."
user-invocable: true
argument-hint: "Specify draft case title and expected behavior."
---

# Promote Draft Regression Case

Promote one drafted regression case to an active Playwright test.

## When to Use

- Regression expansion
- Draft-to-active promotion

## Scope

- Primary target: `e2e/regression/turn-navigation-edge-drafts.spec.ts`
- Keep remaining draft cases skipped unless explicitly requested

## Procedure

1. Select exactly one draft case.
2. Define expected behavior.
3. Implement with resilient selectors.
4. Re-run regression suite:
```bash
npm run test:e2e:regression
```
5. Report validation result and residual flake risk.

## Output Format

```text
Promoted Case:
- <draft title>

Behavior Contract:
- <expected behavior list>

Files Changed:
- <path>

Validation:
- regression suite: pass|fail

Residual Risks:
- <risk>
```

Hard fail on multiple promotions, required-suite drift, or missing validation run.
