# Current Plan - App-Wide Layout Verification Pass

**Status**: Complete
**Started**: 2026-09-08
**Target Completion**: 2026-09-08

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

- [x] MCP tool availability reconfirmed in the session doing this pass.
- [x] `/new-game` overflow reproduced with concrete measurements (not assumed) and root cause identified. Result: does NOT reproduce on `ModeSelection` itself (default state or with 8 extra counter definitions) at any of the four breakpoints; `overflow`/`overflow-y` on `html`/`body`/`#root`/`.page-center` are `visible` in all cases.
- [x] `/new-game` fix applied and verified scrollable/reachable at all four breakpoints. Result: no fix needed for `ModeSelection`; the real bug was on `/settings` (reached via "Edit Game Settings"), which is what the report most likely referred to.
- [x] Found and fixed a real, confirmed horizontal-overflow bug on `/settings` at 390×844: unconstrained `<select>`/`.input` intrinsic width inside `.controls-row` blew out ancestor grid tracks (`scrollWidth` 723px in a 390px viewport), making roughly half the page's controls unreachable — a WCAG 1.4.10 (Reflow) blocker. Fixed in `src/styles/layout.css` (`.controls-row > select/.input` min/max-width, `.flex-1` min-width, `.header-row` grid hardening) and `src/styles/themes/generic.css` (`.input, select` min/max-width). Verified clean at all four breakpoints, both themes, and on `/#/shared` and `/#/multiplayer` (no regression to `.flex-1`/`.controls-row` usage elsewhere). Committed and pushed as `54cdf75`.
- [x] `tabletopRotated` player 2/4 report reproduced and explained (fallback breakpoint vs seat-order intent). Confirmed: `EDGE_ORDER`/`getEdgeForIndex` never collide; the perceived "same side" was the portrait-fallback (`@media (max-width: 1024px) and (orientation: portrait)`) rendering left/right seats as visually identical unrotated cards with no distinguishing style, reproduced at 900x950 and 390x844.
- [x] Any resulting `EDGE_ORDER`/breakpoint fix applied and verified with screenshots. Fix: added a themed left/right accent border to `.player-layout-side-left`/`-right` card wraps inside the existing portrait-fallback media query only (no `EDGE_ORDER`/seat-assignment change). Verified in both themes at 1366x768 (landscape, unaffected), 900x950, and 390x844. Committed and pushed as `8987999`.
- [x] Dead Vite boilerplate removed from `src/index.css`: unused root tokens, dark-mode starter block, duplicate `#root` rules, and duplicate global heading rules removed; reset/body sizing/font/number-input normalization preserved. `npm run lint`, `npx tsc --noEmit`, `npm run build`, `npm run test:integration`, and required E2E (5 passed) all pass.
- [x] Full pages × breakpoints matrix screenshot pass completed: `/`, `/new-game`, `/settings`, `/shared`, and `/multiplayer` at 1366x768 and 390x844 in both themes; `tabletopRotated` also rechecked at 1024x768 landscape and 390x844 portrait fallback. No horizontal overflow or unreachable controls found.
- [x] Required quality gates pass after all changes: lint, tsc, build, integration, and required E2E (5 passed).
- [x] Checkpoints committed and pushed for confirmed fixes (`54cdf75`, `8987999`, `e58ae60`) on `feat/layout-verification-pass`.

Handoff is complete with read-only Git status, diff, history, branch, and upstream evidence recorded in `docs/ai/sessions/2026-09-08-layout-verification.md`.

## Dependencies / Blockers

- Full visual matrix is complete. Remaining risk is existing mobile counter minus/plus controls measuring approximately 12x20px, below the recommended 44x44px touch target; this is a separate accessibility follow-up, not a layout overflow blocker.

## Deferred Backlog

- Define historical win/elimination threshold behavior before promoting the skipped E2E drafts in `e2e/regression/turn-navigation-edge-drafts.spec.ts`.
- Add dedicated accessibility automation after the minimal MCP/Playwright evidence policy has produced enough signal to define a useful required gate.
- Optional: compact the shared-device header/turn-banner specifically for table layouts so the full table fits without the auto-scroll-to-active-player needing to move the viewport away from the page header.

## Decision Rationale

- Do not fix either newly reported bug from description alone; this session's tabletop work proved static reasoning missed real, measurable overflow bugs that only live MCP measurement caught.
- Treat the leftover `src/index.css` template boilerplate as dead cosmetic code, not the root cause of the Settings overflow (that was proven to be intrinsic select/input width).
- Keep fixes scoped one-at-a-time with before/after evidence and a quality-gate/commit cycle per fix, matching the bounded-iteration discipline already established this session.
