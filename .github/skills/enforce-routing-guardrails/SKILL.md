---
name: enforce-routing-guardrails
description: "Validate strict worker ownership before delegation. Reject routing when proposed files do not match the assigned worker domain."
user-invocable: true
argument-hint: "Provide worker name and proposed file paths."
---

# Enforce Routing Guardrails

Validate worker-to-file ownership before implementation starts.

## When to Use

- Before delegating implementation tasks
- When a worker proposes edits outside expected domain
- During coordinator acceptance checks

## Ownership Rules

1. `E2EImplementer` owns:
- `e2e/**`
- `playwright.config.ts`

2. `TypeScriptImplementer` owns:
- `src/**/*.ts`
- `src/**/*.tsx`
- related app config files

3. `QualityGateRunner` owns verification outputs, not code edits.
4. `GitCheckpointWorker` owns git checkpoint operations and session checkpoint log updates.
5. `Handoff` owns memory docs under `docs/ai/**` and customization docs when explicitly requested.

## Procedure

1. Receive proposed worker + file list.
2. Compare each file path to ownership rules.
3. Return one of:
- `allow`
- `reject-and-reroute`
4. If rejecting, provide exact reroute target worker and reason.

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

## Hard-Fail Conditions

- Any `e2e/**` file assigned to `TypeScriptImplementer`
- Any `src/**` app logic file assigned to `E2EImplementer` without explicit testability-fix approval
- Mixed-domain edit sets assigned to a single worker without split delegation
