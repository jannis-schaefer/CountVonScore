---
name: enforce-routing-guardrails
description: "Validate strict worker ownership before delegation. Reject routing when proposed files do not match the assigned worker domain."
user-invocable: true
argument-hint: "Provide worker name and proposed file paths."
---

# Enforce Routing Guardrails

Validate worker-to-file ownership.

## When to Use

- Before delegation
- During acceptance checks

## Ownership Rules

- `E2EImplementer`: `e2e/**`, `playwright.config.ts`
- `TypeScriptImplementer`: `src/**/*.ts`, `src/**/*.tsx`, app config
- `QualityGateRunner`: verification evidence
- `GitCheckpointWorker`: git checkpoints + session checkpoint log
- `Handoff`: `docs/ai/**` memory updates

## Procedure

1. Compare proposed files to ownership rules.
2. Return `allow` or `reject-and-reroute`.
3. On reject, provide target worker.

## Output Format

```text
Routing Decision: allow | reject-and-reroute
Worker: <worker>
Files Checked:
- <path>

Violations:
- <path> -> expected owner <worker>

Next Owner:
- <worker>
Reason:
- <short rationale>
```

Hard fail on wrong-domain ownership.
