---
name: capture-session-handoff-pack
description: "Update session memory artifacts as one pack: current plan progress, decision log entries, and dated session handoff note."
user-invocable: true
argument-hint: "Summarize completed work, unresolved blockers, and key decisions."
---

# Capture Session Handoff Pack

Capture durable session memory before closeout.

## When to Use

- End of session
- Milestone transition requiring durable context handoff

## Required Artifacts

1. `docs/ai/current-plan.md` progress/status update
2. `docs/ai/decision-log.md` append-only entries for new decisions
3. `docs/ai/sessions/YYYY-MM-DD-hhmm.md` dated session note
4. `docs/ai/sessions/current-session.md` checkpoint log updated

## Procedure

1. Summarize completed work and remaining blockers.
2. Update plan status and completed verification checks.
3. Append decisions with context/rationale/impact.
4. Create dated handoff note with next steps.
5. Verify cross-file consistency.

## Output Format

```text
Handoff Pack Status: complete | partial

Artifacts Updated:
- <path>
- <path>

Decisions Added:
- <title>

Remaining Risks:
- <risk>

Next Session Entry Point:
1. <step>
2. <step>
```

## Hard-Fail Conditions

- Closing session without dated handoff note
- Marking complete with unresolved blockers not documented
- Rewriting prior decision history instead of append-only updates
