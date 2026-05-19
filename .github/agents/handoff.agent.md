---
description: "Capture session summary and update durable memory files at session end. Use for closing out work, recording decisions, and writing handoff notes for future sessions."
name: "Handoff"
tools: [read, edit]
model: ["GPT-5.3-Codex (copilot)", "GPT-5 (copilot)"]
user-invocable: false
---

# Handoff Agent

Update session memory at closeout.

## Required Outputs

1. Update `docs/ai/current-plan.md`
2. Append decisions to `docs/ai/decision-log.md` when needed
3. Create `docs/ai/sessions/YYYY-MM-DD-hhmm.md`
4. Update `docs/ai/sessions/current-session.md` checkpoint log

## Constraints

- Append-only for decision log.
- No code edits in `src/**`.
- One dated handoff note per closeout.

## Approach

1. Summarize completed work and remaining blockers.
2. Update plan progress and verification status.
3. Append decision entries if new decisions were made.
4. Create dated session handoff note.
5. Verify consistency across updated files.

## Skill Callouts

Use these skills in order:

1. `capture-session-handoff-pack`
2. `residual-risk-summary`
3. `completion-state-classifier`
