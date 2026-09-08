# Current Plan - App-Wide Layout Verification Pass

**Status**: Planned
**Started**: 2026-09-08
**Target Completion**: TBD

## Prior Phase Outcome (complete, committed)

The four-player tabletop layout work is done and pushed (`3455c2e`): seats are centered on their edges, rotated squares scale with viewport height, and all required gates pass. Two open questions from that phase carry into this pass rather than being fixed blindly:

1. User-reported: "player 2 and 4 are on the same side" in `tabletopRotated`. Static analysis of `EDGE_ORDER`/`getEdgeForIndex` in `src/components/PlayerCardsLayout.tsx` proves indices 1 and 3 (players 2 and 4) always resolve to opposite edges (`right`/`left`) for a 4-player game — no code path produces a literal collision. Leading hypothesis: the portrait/narrow-window fallback (`@media (max-width: 1024px) and (orientation: portrait)`) collapses all four seats into one vertical column, so on a narrow-but-not-truly-mobile window, player 2 and player 4 both lose rotation and look interchangeable ("the same side"). Needs live confirmation.
2. User-reported: the `/new-game` screen (`ModeSelection.tsx`, wrapped in `.page-center`) overflows without being scrollable, making most of its controls unreachable.

## Suspected Root Cause For Item 2 (verify before trusting)

`src/index.css` still contains leftover Vite-template boilerplate that conflicts with the app's real `#root` rule in `src/App.css`:

- `src/index.css` sets `#root { width: 1126px; max-width: 100%; text-align: center; border-inline: 1px solid var(--border); min-height: 100svh; ... }`.
- `src/App.css` sets `#root { width: 100%; min-height: 100vh; display: flex; flex-direction: column; }`.

Both use `min-height` (not `height`), and neither sets `overflow: hidden`, so this doesn't fully explain an unscrollable overflow by itself — but it is definitely dead/unintended boilerplate (stray `text-align: center` and `border-inline` applied app-wide) and a reasonable first cleanup regardless of whether it's the direct cause of item 2. Confirm the real cause with a live MCP `getBoundingClientRect`/computed-style check (same method used for the tabletop fix) before changing anything, the same way the tabletop investigation avoided guessing.

## Scope

Run a systematic layout verification pass across all pages and key breakpoints using Playwright MCP, since this session already found multiple real, non-obvious overflow/centering bugs that static code review alone missed.

## Pages × Breakpoints Matrix

Pages: `/` (HomeMenu), `/new-game` (ModeSelection), `/shared` (SharedDeviceMode — check `grid`, `tabletop`, `tabletopRotated`, `minimalist`, `seatRail` layouts with 2/4/5 players), `/multiplayer` (MultiplayerMode), `/settings` (Settings — longest/most complex form).

Breakpoints: 1366×768 (desktop/tabletop landscape), 1024×768 (tablet landscape boundary), 768×1024 (tablet portrait), 390×844 (phone portrait).

## Steps

1. Confirm Playwright MCP tools are registered and callable in the active session (navigate + snapshot) before starting.
2. For each page × breakpoint combination: capture a screenshot, and measure `document.documentElement.scrollHeight` vs `window.innerHeight` plus `getBoundingClientRect()` on the outer content wrapper to confirm every control is reachable by scroll — do not rely on visual inspection alone, per this session's evidence.
3. Specifically reproduce and resolve the `/new-game` overflow report: measure whether scrolling actually reaches the "Confirm And Start" button at each breakpoint; if not, identify the exact blocking rule (fixed height + `overflow: hidden`, or a grid/flex sizing bug) rather than assuming the leftover `#root` CSS is the cause.
4. Reproduce the `tabletopRotated` "player 2/4 same side" report by resizing to a narrow-but-landscape-leaning window and a genuinely narrow/portrait window, to determine whether the portrait-fallback breakpoint is triggering too eagerly or whether seat-order intent (`EDGE_ORDER` sequence) needs to change.
5. Remove the dead Vite-template `#root` boilerplate from `src/index.css` (`text-align: center`, `border-inline`, width/min-height duplication with `App.css`) as an independent, low-risk cleanup, then re-screenshot affected pages to confirm no visual regression.
6. Apply the smallest fix for each confirmed bug found, one at a time, with before/after screenshot evidence (bounded iteration, same discipline as the tabletop fix).
7. Run required quality gates (`lint`, `tsc`, `build`, `test:integration`) after any code change.
8. Checkpoint and push through `GitCheckpointWorker` after each confirmed, verified fix — do not batch unrelated fixes into one commit.

## Verification

- [ ] MCP tool availability reconfirmed in the session doing this pass.
- [ ] `/new-game` overflow reproduced with concrete measurements (not assumed) and root cause identified.
- [ ] `/new-game` fix applied and verified scrollable/reachable at all four breakpoints.
- [ ] `tabletopRotated` player 2/4 report reproduced and explained (fallback breakpoint vs seat-order intent).
- [ ] Any resulting `EDGE_ORDER`/breakpoint fix applied and verified with screenshots.
- [ ] Dead `#root` boilerplate removed from `src/index.css` and confirmed no visual regression across the pages × breakpoints matrix.
- [ ] Full pages × breakpoints matrix screenshot pass completed with no other undiscovered overflow/reachability bugs.
- [ ] Required quality gates pass after all changes.
- [ ] Checkpoint(s) committed and pushed.

## Dependencies / Blockers

- Terminal execution and Playwright MCP tools were disabled in the tool session that authored this plan; the verification pass itself requires a session where both are enabled and confirmed working before any fix is trusted.

## Deferred Backlog

- Define historical win/elimination threshold behavior before promoting the skipped E2E drafts in `e2e/regression/turn-navigation-edge-drafts.spec.ts`.
- Add dedicated accessibility automation after the minimal MCP/Playwright evidence policy has produced enough signal to define a useful required gate.
- Optional: compact the shared-device header/turn-banner specifically for table layouts so the full table fits without the auto-scroll-to-active-player needing to move the viewport away from the page header.

## Decision Rationale

- Do not fix either newly reported bug from description alone; this session's tabletop work proved static reasoning missed real, measurable overflow bugs that only live MCP measurement caught.
- Treat the leftover `src/index.css` template boilerplate as a plausible but unconfirmed lead, not an assumed root cause.
- Keep fixes scoped one-at-a-time with before/after evidence and a quality-gate/commit cycle per fix, matching the bounded-iteration discipline already established this session.
