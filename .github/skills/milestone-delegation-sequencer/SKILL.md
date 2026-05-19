---
name: milestone-delegation-sequencer
description: "Choose the next worker based on milestone state, blockers, and acceptance policy."
user-invocable: true
---

# Milestone Delegation Sequencer

Determine delegation order for the next milestone.

## Procedure

1. Evaluate current milestone status.
2. Check blockers and required verifications.
3. Select next owner:
- ContextLoader
- TypeScriptImplementer
- E2EImplementer
- QualityGateRunner
- GitCheckpointWorker
- Handoff

## Output

```text
Current Milestone: <name>
Next Owner: <worker>
Why:
- <reason>
Preconditions:
- <condition>
```
