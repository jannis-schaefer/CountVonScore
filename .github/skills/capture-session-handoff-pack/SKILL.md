---
name: capture-session-handoff-pack
description: "Update session memory artifacts as one pack: current plan progress, decision log entries, and dated session handoff note."
user-invocable: true
argument-hint: "Summarize completed work, unresolved blockers, and key decisions."
---

# Capture Session Handoff Pack

Capture durable memory before closeout.

## When to Use

- End of session
- Milestone handoff

## Required Artifacts

1. `docs/ai/current-plan.md`
2. `docs/ai/decision-log.md` (append-only)
3. `docs/ai/sessions/YYYY-MM-DD-hhmm.md`
4. `docs/ai/sessions/current-session.md`

## Procedure

1. Summarize completed work + blockers.
2. Update plan + verification status.
3. Append decisions.
4. Create dated handoff note.
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

Hard fail on missing handoff note, undocumented blockers, or rewritten decision history.
