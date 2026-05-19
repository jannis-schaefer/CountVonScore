---
name: run-required-quality-gates
description: "Run mandatory quality gates and return a blocker-first pass/fail matrix with owner hints."
user-invocable: true
---

# Run Required Quality Gates

Execute required verification gates for this repository.

## Required Commands

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run test:integration
```

Run this too when gameplay/UI behavior changed:

```bash
npm run test:e2e:required
```

## When to Use

- Before milestone completion
- Before feature checkpoint commits
- Before handoff closeout

## Procedure

1. Execute commands in required order.
2. Capture pass/fail and key error lines.
3. Classify failures by likely owner:
- TypeScriptImplementer
- E2EImplementer
- QualityGateRunner
- CI/config owner
4. Return blocker-first matrix.

## Output Format

```text
Gate Matrix:
- lint: pass|fail
- tsc: pass|fail
- build: pass|fail
- integration: pass|fail
- e2e-required: pass|fail|not-required

Blockers:
- <gate>: <error summary>

Likely Owner:
- <worker>

Next Actions:
1. <action>
2. <action>
```

## Hard-Fail Conditions

- Any required gate fails
- Required gate not executed
- Results reported without command evidence when command execution is available
