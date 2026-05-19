---
name: promote-draft-regression-case
description: "Promote exactly one drafted E2E regression scenario into an active test with deterministic assertions and stable selector strategy."
user-invocable: true
argument-hint: "Specify draft case title and expected behavior."
---

# Promote Draft Regression Case

Convert one drafted regression test into an active Playwright test.

## When to Use

- Expanding optional regression coverage
- Implementing one historical draft case at a time

## Scope

- Primary target: `e2e/regression/turn-navigation-edge-drafts.spec.ts`
- Keep remaining draft cases skipped unless explicitly requested

## Procedure

1. Select exactly one draft case.
2. Define expected behavior before coding assertions.
3. Implement with resilient selectors (`getByRole`, `getByLabel`, stable locators).
4. Avoid brittle timing assumptions.
5. Re-run regression suite:
```bash
npm run test:e2e:regression
```
6. Report pass/fail and residual flake risks.

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

## Hard-Fail Conditions

- Promoting more than one draft case in a single run
- Changing required-suite tests without explicit scope
- Missing validation run when command execution is available
