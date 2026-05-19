---
name: run-required-quality-gates
description: "Run mandatory quality gates and return a blocker-first pass/fail matrix with owner hints."
user-invocable: true
---

# Run Required Quality Gates

Execute required verification gates.

## Required Commands

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run test:integration
```

Also run when gameplay/UI changed:

```bash
npm run test:e2e:required
```

## When to Use

- Before milestone completion
- Before closeout

## Procedure

1. Execute commands in order.
2. Capture pass/fail and key errors.
3. Classify likely owner.
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

Hard fail on failed/missing required gates or missing command evidence.
