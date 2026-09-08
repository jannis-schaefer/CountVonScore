# Current Plan - Backlog Triage And Next Implementation Scope

**Status**: In Progress
**Started**: 2026-09-08
**Target Completion**: 2026-09-08

## Scope

Reconcile the repository, record the evidence-backed backlog, and select the next implementation scope.

Primary objective:
- Turn known maintenance items, deferred behavior decisions, and longer-term ideas into a prioritized backlog.

Secondary objective:
- Establish the next implementation scope and preserve checkpoint/push discipline.

## Steps

1. Record the reconciled Git state: `main` matches `origin/main` at `2671994`.
2. Prioritize a concrete documentation repair: remove obsolete Windows helper-script guidance from `README.md`, replace `npm lint` with `npm run lint`, and remove the unrelated ESLint fragment appended after the license.
3. Obtain a product decision for historical edits that reach a win/elimination threshold: recalculate later committed turns on "Apply Changes and Return", or truncate them on "Continue From This Turn".
4. Route the decided historical-edit behavior to `E2EImplementer` and promote the matching skipped regression case(s).
5. Keep deeper accessibility automation as a future enhancement; the current policy remains integration plus breakpoint/DevTools evidence.
6. Run focused validation after each substantive edit, then required quality gates before checkpointing.
7. Create a focused commit and push it through `GitCheckpointWorker`, then run `Handoff` with read-only Git evidence.

## Verification

- [x] Live branch and worktree state verified: `main` matches `origin/main` at `2671994`.
- [x] Unpublished commits and upstream synchronization reviewed.
- [ ] New implementation scope recorded and routed.
- [ ] Focused validation completed for new changes.
- [ ] Required quality gates completed.
- [ ] Focused checkpoint committed and pushed.
- [ ] Handoff completed with read-only Git evidence.

## Dependencies / Blockers

- Historical win/elimination threshold behavior must be specified before the skipped E2E drafts can be promoted.
- No blocker exists for the README repair.

## Backlog

### Ready Now

- Repair `README.md` setup and lint instructions, and remove the unrelated ESLint configuration fragment appended after the license.

### Needs Product Decision

- Define the outcome when a historical turn edit crosses a win/elimination threshold: recalculation of later turns versus truncation of the future timeline. The corresponding skipped scenarios are in `e2e/regression/turn-navigation-edge-drafts.spec.ts`.

### Future Idea

- Add dedicated accessibility automation after the minimal MCP/Playwright evidence policy has produced enough signal to define a useful required gate.

## Decision Rationale

- Session state must be based on live Git evidence, not inherited closeout text.
- Git mutation belongs to `GitCheckpointWorker`; `Handoff` may inspect and report only.
- Do not claim completion while required changes are uncommitted or unpublished.
- Keep behavior-ambiguous E2E scenarios skipped until product semantics are explicit.
