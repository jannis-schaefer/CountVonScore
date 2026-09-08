# Current Plan - Four-Player Tabletop Layout And MCP Verification

**Status**: In Progress
**Started**: 2026-09-08
**Target Completion**: TBD

## Scope

Verify that agents can use Playwright MCP for visual editing feedback, then adapt the four-player tabletop presentation for a phone or tablet lying flat between players.

Primary objective:
- Give each of four players an aligned card at a distinct table edge, rotated to face the player seated at that edge.

Secondary objective:
- Capture repeatable Playwright MCP baseline and post-change screenshot evidence before accepting layout changes.

## Steps

1. Verify the `playwright` MCP server is available to `CSSLayoutSpecialist` by navigating the running app, setting a landscape viewport, and saving a baseline screenshot.
2. Configure a deterministic four-player game and select the existing `tabletopRotated` layout.
3. Inspect the baseline at a desktop/tabletop landscape viewport and targeted tablet landscape viewport(s): four cards must occupy bottom, right, top, and left edges; each must face outward toward its seated player; controls must remain visible and reachable.
4. If tablet breakpoints collapse the table into a vertical list, make the smallest CSS/layout change that retains the four-edge arrangement on usable flat-table tablet viewports while preserving the mobile fallback.
5. Capture matching post-change screenshots through Playwright MCP. Use Chrome DevTools MCP only to diagnose ambiguous rotation, overflow, or box-model issues.
6. Run responsive, theme, touch, and focused automated validation. Report baseline/current screenshot paths, breakpoints, MCP evidence source, and unresolved risks.
7. Commit and push through `GitCheckpointWorker`, then run `Handoff` with read-only Git evidence.

## Verification

- [x] README setup/lint guidance repaired; `npm run lint` validation is blocked because `npm` is unavailable in the current shell.
- [ ] Playwright MCP availability demonstrated with a baseline screenshot.
- [ ] Four-player `tabletopRotated` layout inspected at target landscape breakpoints.
- [ ] Required tablet layout adjustment implemented, if baseline evidence requires it.
- [ ] Post-change Playwright MCP screenshots captured and reviewed.
- [ ] Responsive, theme, touch, and focused automated validation completed.
- [ ] Focused checkpoint committed and pushed.
- [ ] Handoff completed with read-only Git evidence.

## Dependencies / Blockers

- `npm` is unavailable in the current shell, blocking repository scripts and the configured `npx` MCP server command until Node.js is available on `PATH`.
- If Playwright MCP is unavailable to the layout agent after Node.js is restored, record the host/tooling blocker instead of claiming screenshot evidence.

## Deferred Backlog

- Define historical win/elimination threshold behavior before promoting the skipped E2E drafts in `e2e/regression/turn-navigation-edge-drafts.spec.ts`.
- Add dedicated accessibility automation after the minimal MCP/Playwright evidence policy has produced enough signal to define a useful required gate.

## Decision Rationale

- `tabletopRotated` already assigns four seats clockwise at the bottom, right, top, and left with rotations of 0, 90, 180, and -90 degrees; evidence must establish whether its responsive breakpoint preserves the intended flat-table experience.
- Do not claim visual acceptance without baseline and post-change MCP screenshot evidence, or an explicit MCP availability blocker.
- Keep behavior-ambiguous E2E scenarios skipped until product semantics are explicit.
