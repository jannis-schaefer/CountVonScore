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

- [x] README setup/lint guidance repaired; `npm run lint` passes with Node/npm now available.
- [x] `CSSLayoutSpecialist`/direct agent session confirmed `playwright/*` MCP tools registered and callable (`mcp_playwright_browser_navigate`, `_snapshot`, `_take_screenshot`, `_evaluate`, etc.) after the user restarted the MCP server and VS Code.
- [x] Playwright MCP availability demonstrated with baseline and post-change screenshots (see evidence below).
- [x] Four-player `tabletopRotated` layout inspected live via MCP: found two real bugs — (1) top/bottom edge cards were not centered (`justify-content`/`align-content` missing), (2) rotated left/right card squares were hard-coded to 420px regardless of viewport height, causing total table height (~999.5px) to vastly exceed a 768px viewport and pushing the top-edge player (Player 3) completely out of view even with auto-scroll-to-active-player.
- [x] Fixes applied in `src/styles/layout.css`:
  - `.player-layout-side-top`/`.player-layout-side-bottom`: added `justify-content: center`.
  - `.player-layout-side-left`/`.player-layout-side-right`: `align-content: start` → `align-content: center`.
  - `.player-layout-card-wrap-rotated-side`: `width: min(420px, 90vw)` → `width: clamp(200px, 28vh, 420px)` so the rotated squares shrink on short viewports instead of forcing scroll.
- [x] Post-change MCP screenshots confirm all four seats (top/right/bottom/left) are simultaneously visible, correctly centered, and rotated to face outward at 1366×768 and 1024×768 landscape. Portrait fallback (768×1024) unchanged and correct (vertical stack, left/right rotation removed).
- [x] Required quality gates run and passed: `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run test:integration`.
- [ ] Focused checkpoint committed and pushed.
- [ ] Handoff completed with read-only Git evidence.

## Evidence

- Root cause investigation used `mcp_playwright_browser_evaluate` to measure `getBoundingClientRect()`/computed styles directly (not just visual guessing): total `.player-layout-table` height went 999.5px → 886.7px → 794.5px across the two CSS iterations.
- Screenshots captured this session (repo root, not committed): `tabletop-rotated-desktop-1366x768.png` (buggy baseline), `tabletop-rotated-desktop-fullpage.png` (buggy, shows overflow), `tabletop-rotated-desktop-fullpage-fix1.png` (centering only), `tabletop-rotated-desktop-fullpage-fix2.png`, `tabletop-rotated-desktop-1366x768-fix2-final.png` (all 4 seats visible), `tabletop-rotated-tablet-landscape-1024x768.png`, `tabletop-rotated-tablet-portrait-768x1024.png` (fallback unaffected).
- Residual risk: at exactly 1024×768 landscape, the active (bottom) player's third counter row is slightly clipped without scrolling — acceptable but noted as a minor follow-up if a tighter fit is later required.
- The previously reported "tool/terminal unavailable" blockers were resolved once Node/npm were reinstalled for this machine's OS/arch and a fresh agent invocation had `playwright/*` and terminal tools bound.

## Dependencies / Blockers

None currently blocking. MCP tools, Node/npm, and terminal execution are all confirmed working in this session.

## Deferred Backlog

- Define historical win/elimination threshold behavior before promoting the skipped E2E drafts in `e2e/regression/turn-navigation-edge-drafts.spec.ts`.
- Add dedicated accessibility automation after the minimal MCP/Playwright evidence policy has produced enough signal to define a useful required gate.
- Optional follow-up: compact the shared-device header/turn-banner specifically for table layouts so the full table fits without the auto-scroll-to-active-player needing to move the viewport away from the page header.

## Decision Rationale

- `tabletopRotated` already assigns four seats clockwise at the bottom, right, top, and left with rotations of 0, 90, 180, and -90 degrees; the bug was in centering and fixed-size rotated squares, not seat assignment.
- The `CSSLayoutSpecialist` allowlist includes `playwright/*` and `chrome-devtools/*`; the MCP binding and Node/npm reinstall together resolved the earlier tooling blockers.
- Bounded the layout-fix iteration to 3 rounds (centering, clamp v1, clamp v2) per policy; stopped once all four seats fit together in one viewport rather than continuing to guess further size reductions.
- Do not claim visual acceptance without baseline and post-change MCP screenshot evidence, or an explicit MCP availability blocker.
- Keep behavior-ambiguous E2E scenarios skipped until product semantics are explicit.
