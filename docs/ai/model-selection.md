# Model Selection Policy

Canonical model matrix (machine-readable). Contains per-worker configuration used by the `SessionCoordinator`.

```yaml
global_defaults:
  max_retries: 2
  escalate_on:
    - timeout
    - low_confidence
    - repeated_flake
    - failed_assertion
  general_purpose_model: GPT-5.6 Luna
  reasoning_model: GPT-5.6 Terra
  escalation_model: GPT-5.6 Sol
  escalation_policy: failure_only
  reasoning_levels:
    low: GPT-5.6 Luna
    standard: GPT-5.6 Luna
    first_escalation: GPT-5.6 Terra
    final_escalation: GPT-5.6 Sol
  escalation_sequence:
    - GPT-5.6 Luna
    - GPT-5.6 Terra
    - GPT-5.6 Sol

workers:
  SessionCoordinator:
    models:
      - GPT-5.6 Luna
      - GPT-5.6 Terra
    max_retries: 1
    escalate_on:
      - timeout
      - low_confidence
      - repeated_flake
    escalate_to:
      - model: GPT-5.6 Terra
        reasoning_depth: high
      - model: GPT-5.6 Sol
        reasoning_depth: high

  ContextLoader:
    models:
      - GPT-5.6 Luna
      - GPT-5.6 Terra
    max_retries: 2
    escalate_to:
      - model: GPT-5.6 Terra
        reasoning_depth: medium
      - model: GPT-5.6 Sol
        reasoning_depth: high

  TypeScriptImplementer:
    models:
      - GPT-5.6 Luna
      - GPT-5.6 Terra
    max_retries: 2
    escalate_to:
      - model: GPT-5.6 Terra
        reasoning_depth: high
      - model: GPT-5.6 Sol
        reasoning_depth: high

  E2EImplementer:
    models:
      - GPT-5.6 Luna
      - GPT-5.6 Terra
    max_retries: 2
    escalate_to:
      - model: GPT-5.6 Terra
        reasoning_depth: high
      - model: GPT-5.6 Sol
        reasoning_depth: high

  E2EFlakeTriage:
    models:
      - GPT-5.6 Luna
      - GPT-5.6 Terra
    max_retries: 2
    escalate_to:
      - model: GPT-5.6 Terra
        reasoning_depth: high
      - model: GPT-5.6 Sol
        reasoning_depth: high

  CSSLayoutSpecialist:
    models:
      - GPT-5.6 Luna
      - GPT-5.6 Terra
    max_retries: 2
    escalate_to:
      - model: GPT-5.6 Terra
        reasoning_depth: high
      - model: GPT-5.6 Sol
        reasoning_depth: high

  ZustandStateSpecialist:
    models:
      - GPT-5.6 Luna
      - GPT-5.6 Terra
    max_retries: 2
    escalate_to:
      - model: GPT-5.6 Terra
        reasoning_depth: high
      - model: GPT-5.6 Sol
        reasoning_depth: high

  CIWorkflowSpecialist:
    models:
      - GPT-5.6 Luna
      - GPT-5.6 Terra
    max_retries: 2
    escalate_to:
      - model: GPT-5.6 Terra
        reasoning_depth: high
      - model: GPT-5.6 Sol
        reasoning_depth: high

  QualityGateRunner:
    models:
      - GPT-5.6 Luna
      - GPT-5.6 Terra
    max_retries: 2
    escalate_to:
      - model: GPT-5.6 Terra
        reasoning_depth: high
      - model: GPT-5.6 Sol
        reasoning_depth: high

  GitCheckpointWorker:
    models:
      - GPT-5.6 Luna
      - GPT-5.6 Terra
    max_retries: 1
    escalate_to:
      - model: GPT-5.6 Terra
        reasoning_depth: medium
      - model: GPT-5.6 Sol
        reasoning_depth: high

  Handoff:
    models:
      - GPT-5.6 Luna
      - GPT-5.6 Terra
    max_retries: 1
    escalate_to:
      - model: GPT-5.6 Terra
        reasoning_depth: medium
      - model: GPT-5.6 Sol
        reasoning_depth: high
```

## Policy Semantics

- Low and standard work starts on GPT-5.6 Luna.
- GPT-5.6 Terra is the first failure-only escalation target, or the starting model for tasks that require deeper reasoning.
- GPT-5.6 Sol is the final escalation after Terra fails and is terminal; Sol must never escalate back to Luna.
- `models` lists eligibility; the coordinator must not switch models during a successful run.

## Last Updated

2026-09-07
