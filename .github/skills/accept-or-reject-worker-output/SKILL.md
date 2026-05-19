---
name: accept-or-reject-worker-output
description: "Apply strict acceptance policy to worker results. Reject incomplete evidence, wrong routing, or unverified required gates."
user-invocable: true
argument-hint: "Provide worker output summary, files changed, and verification evidence."
---

# Accept Or Reject Worker Output

Apply acceptance policy after each worker run.

## When to Use

- After each worker run
- Before milestone completion

## Required Output Contract

Required fields: Decision, Evidence, Files/Commands, Risks, Next Owner.

## Acceptance Procedure

1. Validate contract completeness.
2. Validate routing with `enforce-routing-guardrails`.
3. Validate required verification evidence.
4. Return `accept`, `reject-retry-same-worker`, or `reject-reroute-worker`.

Gate summaries without command evidence are insufficient when runnable.

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

Hard fail on wrong routing, missing contract fields, or missing required verification.
