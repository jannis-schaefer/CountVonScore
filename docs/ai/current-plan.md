# Current Plan - Agentic Workflow Governance And Validation

**Status**: In progress
**Started**: 2026-05-19
**Target Completion**: 2026-05-20

## Scope

Finalize the agent platform governance baseline so future implementation sessions run predictably.

Primary objective:
- Enforce deterministic coordinator policy for routing, acceptance, reasoning effort, and cost-aware model selection.

Secondary objective:
- Capture durable memory updates so future sessions can resume without context loss.

## Steps

1. Define and tighten coordinator routing and acceptance guardrails.
2. Normalize worker output contracts and reduce instruction drift.
3. Centralize runtime reasoning ownership in coordinator policy.
4. Define per-worker reasoning defaults and escalation rules.
5. Define cost-aware model selection defaults and high-cost escalation triggers.
6. Document coordinator-vs-worker policy ownership split in repo instructions.
7. Capture model-selection rationale and re-evaluation procedure in AI memory docs.
8. Run smoke validation of delegation behavior and verify expected worker routing.
9. Execute required quality gates for any code-changing sessions that follow.
10. Commit and push focused checkpoints after each meaningful milestone.

## Verification

- [x] Coordinator routing and acceptance guardrails are explicit.
- [x] Worker output contract expectations are explicit.
- [x] Reasoning ownership split is documented in central instructions.
- [x] Per-worker reasoning effort defaults are documented in coordinator.
- [x] Cost-aware model matrix and escalation triggers are documented.
- [x] Model policy is documented in `docs/ai/model-selection.md` with re-evaluation triggers.
- [ ] Delegation smoke run executed against the updated policy baseline.
- [ ] Push status confirmed once remote upstream is available.

## Dependencies / Blockers

- Remote upstream may not be configured in this environment.
- Smoke validation depends on user-driven prompt execution in chat/runtime.

## Decision Rationale

- Runtime policy belongs in coordinator because it owns retries, reroutes, and escalation.
- Worker files should stay domain-focused and not duplicate orchestration policy.
- High-cost models are escalation-only unless pricing or quality constraints change materially.
