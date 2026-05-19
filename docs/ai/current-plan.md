# Current Plan — Session 1 QA And Regression Stabilization

**Status**: Ready to start
**Started**: 2026-05-19
**Target Completion**: 2026-05-19

## Scope

Run the first official implementation session using the new agent workflow and memory structure.

Primary objective:
- Clear lint debt so the full quality gate can be used consistently.

Secondary objective:
- Prepare turn-navigation historical-edit regression coverage from drafted test cases.

This session starts with QA first because lint currently blocks `npm run verify` and can block unrelated feature work.

## Steps

1. Start a feature branch for Session 1 work.
2. Initialize `docs/ai/sessions/current-session.md` with intent and active step, then commit checkpoint.
3. Run `npm run lint` and capture the full error baseline.
4. Group lint failures by file and rule family.
5. Fix `react-hooks/set-state-in-effect` issues in context and page files.
6. Fix `react-refresh/only-export-components` issues by separating shared exports from component files where needed.
7. Re-run lint and iterate until clean.
8. Run `npx tsc --noEmit` and fix any TypeScript regressions introduced during lint cleanup.
9. Run `npm run build` and resolve build regressions if any.
10. Run `npm run test:integration` and verify smoke plus behavioral tests remain green.
11. Run `npm run test:e2e:required` and verify required E2E flows remain green.
12. Update `e2e/regression/turn-navigation-edge-drafts.spec.ts` by selecting the first historical-edit case to implement (optional regression, not required gate).
13. Implement that one historical-edit regression test and keep the other draft cases skipped.
14. Re-run `npm run test:e2e:regression` to ensure optional suite remains stable.
15. Update planning and logs (`current-plan`, `decision-log`, dated session note), then commit session checkpoint.

## Verification

How we know Session 1 is complete:

- [ ] `npm run lint` passes clean
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] `npm run test:integration` passes
- [ ] `npm run test:e2e:required` passes
- [ ] At least one drafted historical-edit edge case is implemented in optional regression suite
- [ ] Session memory docs updated and committed

## Dependencies / Blockers

- Remote upstream is not configured yet, so pushes currently fail. Continue local checkpoint commits and push once remote is available.
- Optional regression flow C remains manual (by design), and release gate uses required flows A and B only.

## Decision Rationale

- Lint QA is first because lint failure blocks the agreed quality gate and may slow unrelated feature development.
- Historical-edit turn-navigation cases are kept optional/regression-first until expected behavior details are fully agreed.
- Required E2E gate remains minimal to control CI runtime and complexity.
