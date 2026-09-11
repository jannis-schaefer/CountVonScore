# Current Plan - Backlog Follow-Ups

**Status**: Discussion (item 1 in progress)
**Started**: 2026-09-11
**Target Completion**: TBD

## Scope

Address the four items deferred from the layout verification pass (see `docs/ai/decision-log.md` and the merged `feat/layout-verification-pass` history):

1. Define historical win/elimination threshold behavior, then promote the two skipped E2E drafts in `e2e/regression/turn-navigation-edge-drafts.spec.ts`.
2. Enlarge mobile counter +/- controls (currently ~12x20px, below the recommended 44x44px touch target).
3. Optional: add dedicated accessibility automation once enough MCP/Playwright evidence signal exists.
4. Optional: compact the shared-device header/turn-banner for table layouts so auto-scroll-to-active-player isn't needed to see the whole table.

Item 1 is a product-design decision, not a bug fix — current code intentionally leaves it undefined (the two related E2E scenarios are `test.skip`). Do not implement anything for item 1 until the desired behavior is explicitly confirmed with the user.

## Item 1: Historical Win/Elimination Threshold Behavior

### Current mechanics (verified from code, not assumed)

- `applyHistoricalChangesState` (`src/store/engine/turns.ts`): edits the historical turn's `endPlayers`, then **recalculates every later turn's start/end state forward** by re-applying each turn's original delta on top of the new baseline. It already calls `getNextActivePlayerIndex` (elimination-aware) when picking each turn's acting player, so turn *rotation* already skips players who are out of rotation at that point. It does **not** stop or truncate the timeline if a threshold is crossed — recalculation always continues through every existing later turn.
- `continueFromHistoricalTurnState`: truncates all turns after the edited one and starts a fresh timeline from the edited state, using elimination-aware next-player selection for the new turn.
- Neither function currently special-cases "a threshold was newly crossed by this edit" — elimination status is a derived, per-render calculation (`evaluatePlayerEliminationStatus`), not a stored decision point.

### The actual open question

For "Apply Changes and Return" (recalculate path), if the edit causes a player to newly cross the win/elimination threshold at the edited turn:
- **Option A — Keep recalculating everything (current implicit behavior).** All later turns are recalculated and kept as-is; the now-eliminated/won player is simply skipped in turn rotation from that point forward via `getNextActivePlayerIndex`. Their pre-existing recorded turn actions after the threshold point remain in history even though they were retroactively out of rotation.
- **Option B — Truncate at the threshold, same as "Continue From This Turn".** If recalculation detects the threshold was crossed at the edited turn, drop all turns after it (as if the user had chosen "Continue From This Turn" automatically), since it may not make sense to keep "what if" turns for a player who shouldn't have gotten them.
- **Option C — Warn and let the user choose in the moment.** Detect the threshold crossing during "Apply Changes and Return" and prompt: keep the full recalculated timeline (A) or truncate from this point (B), rather than silently picking one.

There's also a secondary question: if the win/elimination event determines the *whole game's* winner (not just one player's placement), should reaching that threshold retroactively lock the game as finished, or just remove that one player from rotation while others continue?

### Questions for the user

1. Which of A/B/C above matches the intended experience?
2. Does crossing a "win" threshold (as opposed to "loss"/elimination) retroactively end the whole game, or only affect that one player's rotation/placement?
3. Should this behavior differ between "loss elimination" and "winning placement" outcome types (`EliminationOutcome`), or be handled identically?

## Steps

1. Discuss and record the answer to item 1 above before writing any code (this step).
2. Implement the confirmed behavior in `src/store/engine/turns.ts` (and `elimination.ts` if needed), with focused unit-level coverage in `scripts/integration-behavior.ts` if applicable.
3. Promote the two skipped drafts in `e2e/regression/turn-navigation-edge-drafts.spec.ts` to real assertions matching the confirmed behavior.
4. Item 2: increase counter +/- button touch targets toward 44x44px in `src/styles/layout.css`/theme CSS, verify with Playwright MCP at mobile breakpoints, no regression to desktop density.
5. Item 3: only scope if the user wants it now; otherwise leave deferred.
6. Item 4: only scope if the user wants it now; otherwise leave deferred.
7. Run required quality gates after each change; checkpoint and push per confirmed fix, not batched.

## Verification

- [ ] Item 1 behavior decided explicitly by the user (not assumed).
- [ ] Item 1 implemented and the two skipped E2E drafts promoted and passing.
- [ ] Item 2 touch targets enlarged and verified via MCP at mobile breakpoints with no desktop regression.
- [ ] Item 3 scoped or explicitly deferred again.
- [ ] Item 4 scoped or explicitly deferred again.
- [ ] Required quality gates pass after each change.
- [ ] Checkpoints committed and pushed per confirmed fix.

## Dependencies / Blockers

- Item 1 implementation is blocked on the user's answer to the three questions above.

## Decision Rationale

- Elimination/rotation mechanics already exist and are reused correctly by both historical-edit paths; the ambiguity is specifically about whether recalculation should truncate on newly-crossed thresholds, not about the turn-rotation-skip logic itself.
- Per prior session's decision rationale, keep behavior-ambiguous E2E scenarios skipped until product semantics are explicit — do not guess this one either.
