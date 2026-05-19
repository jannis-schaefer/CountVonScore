---
name: e2e-selector-hardening
description: "Harden Playwright selectors toward resilient role/label/test-id locators and reduce brittle DOM coupling."
user-invocable: true
---

# E2E Selector Hardening

Improve selector resilience in E2E tests.

## Priority

1. `getByRole`
2. `getByLabel`
3. stable `getByTestId`
4. avoid CSS locators unless necessary

## Output

- Replaced selectors
- Residual brittle selectors
- Risk notes
