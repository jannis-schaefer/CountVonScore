# CSS Layout Agent MCP Bindings

This file defines recommended MCP servers for autonomous CSS/layout iteration.

## Config Location

- Workspace config: `.vscode/mcp.json`

## Bound Servers

1. `playwright`
- Purpose: deterministic app navigation, viewport control, screenshots for render feedback loops
- Core use: baseline capture, post-change capture, breakpoints, evidence snapshots

2. `chrome-devtools`
- Purpose: inspect computed styles and layout diagnostics when screenshot diffs are ambiguous
- Core use: box model, overflow, stacking context, media query verification

Accessibility is evaluated through Playwright/DevTools evidence until a dedicated accessibility MCP package is validated for this environment.

## Accessibility Integration (Recommended)

Accessibility checks are a natural fit in QA acceptance for layout work.

Recommended rollout:

1. Start as non-blocking regression signal for 1-2 sprints.
2. Promote critical issues (blocked controls, unreadable contrast) to release blockers.
3. Keep minor a11y findings as backlog unless user flow is impacted.
4. Follow blocker policy in `docs/ai/qa-accessibility-policy.md`.

## Acceptance Evidence for CSS Agent

For non-trivial layout requests, require:

- Screenshot evidence at agreed breakpoints
- Responsive findings (overlap/clipping/off-screen controls)
- Theme compatibility findings
- Accessibility findings summary (blocking vs non-blocking)
