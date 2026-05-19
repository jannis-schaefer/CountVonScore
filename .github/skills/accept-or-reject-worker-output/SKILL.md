---
name: accept-or-reject-worker-output
description: "Apply strict acceptance policy to worker results. Reject incomplete evidence, wrong routing, or unverified required gates."
user-invocable: true
argument-hint: "Provide worker output summary, files changed, and verification evidence."
---

# Accept Or Reject Worker Output

Apply hard acceptance checks for coordinator-controlled worker results.

## When to Use

- After every worker run
- Before moving to next worker milestone
- Before marking step complete

## Required Output Contract

Worker output must include all fields:
- Decision
- Evidence
- Files changed or commands run
- Risks
- Recommended next owner

If any field is missing, reject.

## Acceptance Procedure

1. Validate output contract completeness.
2. Validate routing ownership with `enforce-routing-guardrails`.
3. Validate verification evidence for required gates.
4. Decide:
- `accept`
- `reject-retry-same-worker`
- `reject-reroute-worker`

## Verification Rule

When gates are required and command execution is available, diagnostics-only summaries are insufficient.

## Output Format

```text
Decision: accept | reject-retry-same-worker | reject-reroute-worker
Worker: <worker>
Contract Check: pass | fail
Routing Check: pass | fail
Verification Check: pass | fail

Missing/Failed Items:
- <item>

Required Next Action:
- <action>
Next Owner:
- <worker>
```

## Hard-Fail Conditions

- Wrong worker owns changed files
- Output contract incomplete
- Required verification omitted while runnable
- Attempt to mark task complete with unresolved blocker evidence
