# Model Selection Policy

## Purpose

Define cost-aware model defaults for agent workers and escalation triggers.

## Purpose

Define the authoritative, canonical per-worker model assignment matrix to be consulted at runtime by the `SessionCoordinator`.

## Default Assignment Matrix (canonical)

The canonical per-worker default model assignments (primary listed first, fallbacks optional) used by the `SessionCoordinator` at delegation time:

1. `SessionCoordinator`: `GPT-5.4`
2. `ContextLoader`: `GPT-5 mini`
3. `TypeScriptImplementer`: `GPT-5.3-Codex`
4. `E2EImplementer`: `GPT-5.3-Codex`
5. `E2EFlakeTriage`: `GPT-5.4`
6. `CSSLayoutSpecialist`: `Claude Sonnet 4.6`
7. `ZustandStateSpecialist`: `GPT-5.3-Codex`
8. `CIWorkflowSpecialist`: `GPT-5.4`
9. `QualityGateRunner`: `GPT-5.4`
10. `GitCheckpointWorker`: `GPT-5 mini`
11. `Handoff`: `GPT-5 mini`

**Canonical source:** this file is the authoritative model matrix. The `SessionCoordinator` MUST load and consult this document at delegation time and may pass an explicit `model` override to a worker invocation based on the matrix and runtime cost/availability constraints. For rationale, cost assumptions, escalation policy, and re-evaluation procedure, see `model-selection-recommendations.md`.
## Last Updated

2026-05-26
