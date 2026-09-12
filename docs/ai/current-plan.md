# Current Plan - Backlog Follow-Ups

**Status**: In Progress (item 1 implementation)
**Started**: 2026-09-11
**Target Completion**: TBD

## Scope

Address the four items deferred from the layout verification pass (see `docs/ai/decision-log.md` and the merged `feat/layout-verification-pass` history):

1. Historical win/elimination threshold behavior (decided, implementing).
2. Enlarge mobile counter +/- controls (currently ~12x20px, below the recommended 44x44px touch target).
3. Optional: add dedicated accessibility automation once enough MCP/Playwright evidence signal exists.
4. Optional: compact the shared-device header/turn-banner for table layouts so auto-scroll-to-active-player isn't needed to see the whole table.

## Item 1: Historical Win/Elimination Threshold Behavior — Decided Design

**User decision (2026-09-11): Option C.** When "Apply Changes and Return" causes a player to newly cross a win/loss/placement threshold at the edited turn, and that player has recorded turns later in the (pre-edit) history, do not silently recalculate. Prompt the user with three choices:

1. **Continue from this point** — truncate the timeline at the edited turn, equivalent to the existing "Continue From This Turn" flow.
2. **Keep phantom turns and damage** — commit the full recalculation as today's code already does (no change).
3. **Remove phantom turns and damage from the ledger** — replay forward, but exclude the now-eliminated/won player's own turns and any counter effects (including damage to other players) those turns caused, while keeping every other still-active player's genuine subsequent turns.

Applies uniformly to win, loss, and placement outcomes — no special-casing by `EliminationOutcome` type.

### Root cause of "phantom damage" (verified from code)

`applyHistoricalChangesState` recalculates forward by replaying each turn's **original delta** (`buildTurnDelta`/`applyTurnDelta`) on the new baseline. Turn rotation (`actingPlayerId`) is already correctly reassigned to skip eliminated players via `getNextActivePlayerIndex` — but the delta itself, computed from the *original* turn's start/end player state, still gets applied regardless of who is now nominally "acting" for that turn slot. So a turn that was originally the now-eliminated player's turn (e.g. "reduce Player Y's Authority by 3") still silently applies that same effect to Player Y under a relabeled acting player, even though that player should never have taken the turn. This is what "phantom turns and phantom damage" refers to.

### Detection algorithm

A turn at original index `i` (where `i > editedIndexFromTurn`) is **phantom** if: the *original* `turnRecords[i].actingPlayerId` refers to a player who, per the recalculated state at the start of turn `i`, is already out of rotation (`isPlayerOutOfTurnRotation`/`evaluatePlayerEliminationStatus` against the active `EliminationConfig`).

### Resolution semantics

- `continueFromPoint`: reuse `continueFromHistoricalTurnState` unchanged (already truncates correctly).
- `keepPhantom`: commit the existing `applyHistoricalChangesState` result unchanged (today's behavior, now opt-in rather than automatic).
- `removePhantom`: new pure function. Walk the same forward recalculation loop, but for turns flagged as phantom, skip applying that turn's delta (treat it as a no-op) and splice that turn record out of `turnRecords` entirely (renumbering subsequent turns and their `latestKeyTurnNumber`), while still applying every non-phantom turn's delta normally.

### Implementation plan (phased, one checkpoint per phase)

1. Pure engine layer in `src/store/engine/turns.ts`: `findPhantomTurns(...)` detection helper, `removePhantomTurnsState(...)` resolution function. No store/UI wiring yet. Add coverage in `scripts/integration-behavior.ts`.
2. Store wiring in `src/store/gameStore.ts`: `applyHistoricalChanges` detects phantom turns; if any exist, store a `pendingThresholdReview` state instead of committing immediately. Add `resolveThresholdReview(choice)` action implementing the three resolutions.
3. Minimal UI in `src/pages/SharedDeviceMode.tsx`: render the three-way prompt only when `pendingThresholdReview` is set.
4. Promote the two skipped drafts in `e2e/regression/turn-navigation-edge-drafts.spec.ts` and add coverage for the new prompt paths.
5. Required quality gates + checkpoint after each phase.

## Steps (remaining items)

1. Item 2: increase counter +/- button touch targets toward 44x44px in `src/styles/layout.css`/theme CSS, verify with Playwright MCP at mobile breakpoints, no regression to desktop density.
2. Item 3: only scope if the user wants it now; otherwise leave deferred.
3. Item 4: only scope if the user wants it now; otherwise leave deferred.

## Verification

- [x] Item 1 behavior decided explicitly by the user (Option C, detailed above).
- [x] Item 1 pure engine layer implemented with test coverage (`findPhantomTurns`, `removePhantomTurnsState` in `src/store/engine/turns.ts`; synthetic 6-turn scenario in `scripts/integration-behavior.ts`).
- [x] Item 1 store wiring implemented (`pendingThresholdReview` state, `resolveThresholdReview` action in `src/store/gameStore.ts`).
- [x] Item 1 UI implemented ("Elimination/Win Threshold Reached" prompt in `src/pages/SharedDeviceMode.tsx`).
- [x] Item 1 E2E drafts promoted and passing: both original skipped drafts rewritten plus a new third test for `removePhantom`, all 4 tests in `e2e/regression/turn-navigation-edge-drafts.spec.ts` pass, verified stable across a 3x repeat run (12/12).
- [x] Item 1 bug found and fixed during E2E verification: `applyHistoricalChanges`/`resolveThresholdReview` initially called `findPhantomTurns`/`removePhantomTurnsState` with stale pre-edit `turnRecords`, so the edit itself was never reflected in phantom detection. Fixed by having both functions accept `viewedPlayers` and patch the edited turn internally, matching the existing `applyHistoricalChangesState`/`continueFromHistoricalTurnState` calling convention.
- [ ] Item 2 touch targets enlarged and verified via MCP at mobile breakpoints with no desktop regression.
- [ ] Item 3 scoped or explicitly deferred again.
- [ ] Item 4 scoped or explicitly deferred again.
- [x] Required quality gates pass after each change (lint, tsc, build, integration, required E2E all green as of commit `026ad51`).
- [x] Checkpoints committed and pushed per confirmed fix (`3f21bdc`, `776d780`, `bff42e5`, `c9594d7`, `026ad51` on `feat/backlog-followups`).

**Item 1 status: Complete.**

## Dependencies / Blockers

None currently for item 1 (complete). Items 2-4 remain open; item 2 is next.

## Decision Rationale

- Elimination/rotation mechanics already exist and are reused correctly by both historical-edit paths; the actual gap was that delta replay ignores rotation reassignment, silently preserving a since-eliminated player's original effects. This was confirmed by reading the code, not assumed.
- Applying the three-way choice uniformly across win/loss/placement avoids introducing asymmetric special cases not requested by the user.
- Phased implementation (engine → store → UI → E2E) with a checkpoint per phase matches the bounded, evidence-per-step discipline used in the prior layout verification session.
- E2E verification is what actually caught the stale-turnRecords bug — reinforces that behavior-affecting logic must be checked end-to-end, not just unit-tested in isolation.
