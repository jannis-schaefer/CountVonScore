# Model Selection Policy

## Purpose

Define cost-aware model defaults for agent workers and escalation triggers.

## Cost Assumptions (Current)

1. `Claude Opus 4.6`: 3x
2. `Claude Sonnet 4.6`: 1x
3. `GPT-5.4`: 1x
4. `Gemini 2.5 Pro`: 1x
5. `GPT-5 mini`: free tier (lower capability)
6. `Claude Opus 4.7`: 15x (opt-in only)

## Key Decision

1. Do not use `Claude Opus 4.7` as a default.
2. Do not use `Claude Opus 4.6` as a default.
3. Prefer 1x models for high-value default work.
4. Use `GPT-5 mini` for deterministic procedural tasks.

## Default Assignment Matrix

1. `ContextLoader`: `GPT-5 mini`
2. `TypeScriptImplementer`: `Claude Sonnet 4.6`
3. `E2EImplementer`: `GPT-5.4`
4. `E2EFlakeTriage`: `Gemini 2.5 Pro`
5. `CSSLayoutSpecialist`: `Claude Sonnet 4.6`
6. `ZustandStateSpecialist`: `Gemini 2.5 Pro`
7. `CIWorkflowSpecialist`: `GPT-5.4`
8. `QualityGateRunner`: `GPT-5.4`
9. `GitCheckpointWorker`: `GPT-5 mini`
10. `Handoff`: `GPT-5 mini`

## Escalation Policy

1. Escalate to `Claude Opus 4.6` only after two failed attempts at default models.
2. Escalate only for high-impact blockers:
3. Architecture invariants still unresolved after specialist retry.
4. Recurring E2E flakes still unresolved after deterministic stabilization retry.
5. CI policy deadlock that blocks required checks.
6. De-escalate back to defaults after blocker resolution.

## Re-Evaluation Triggers

1. Any pricing tier shift greater than 30% for a default model.
2. Any model deprecation or newly available model in the same tier.
3. Repeated quality regressions for a worker over three sessions.
4. Significant tool-support change for a model used by tool-heavy workers.

## Re-Evaluation Procedure

1. Re-run one smoke scenario per worker with current defaults.
2. Compare pass rate, first-pass success, and reroute frequency.
3. Update this document and coordinator policy together.
4. Record rationale in `docs/ai/decision-log.md`.

## Last Updated

2026-05-19
