---
name: layout-screenshot-diff-triage
description: "Triage screenshot diffs by severity and map each finding to required CSS remediation."
user-invocable: true
---

# Layout Screenshot Diff Triage

Turn visual diffs into actionable, severity-ranked fixes.

## Evidence Source

- Prefer screenshots captured through the configured `playwright` MCP server.
- When a difference needs diagnosis, inspect the rendered page with `chrome-devtools` MCP before assigning a CSS root cause.
- Record the evidence source and viewport for every finding. A Playwright CLI fallback is valid evidence, but must be labeled as such.

## Severity Rubric

- Critical: hidden controls, unreadable text, blocked turn flow, interaction impossible
- Major: overlap/clipping causing usability loss
- Minor: spacing/alignment/polish drift without usability loss

## Triage Rules

1. Group findings by user impact, not by CSS selector.
2. Prefer one root-cause fix over many local overrides.
3. Mark acceptance as blocked if any Critical finding remains.

## Output

```text
Diff Status: pass | fail
Critical:
- <finding>
Major:
- <finding>
Minor:
- <finding>
Required Fixes:
- <fix>
```
