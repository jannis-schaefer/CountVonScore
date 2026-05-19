---
name: capture-handoff
description: "Summarize completed work and update durable memory at session end. Use for writing session notes, recording decisions, and closing out or advancing the current plan."
user-invocable: true
argument-hint: "Briefly describe what was completed in this session."
---

# Capture Handoff

Update session memory at closeout.

## When to Use

- End of session
- Milestone handoff
- Decision capture

## Procedure

1. Capture:
   - completed work
   - remaining blockers
   - decisions
2. Update:
   - `docs/ai/sessions/YYYY-MM-DD-hhmm.md`
   - `docs/ai/current-plan.md`
   - `docs/ai/decision-log.md` (append-only if needed)
3. Commit and push:
   ```bash
   git add docs/ai/
   git commit -m "chore: session handoff - <brief summary>"
   git push
   ```

4. Merge when production-ready:
   ```bash
   git checkout main && git merge feat/<slug> && git push
   git branch -d feat/<slug>
   ```
   `current-session.md` on main stays as the empty template automatically (`.gitattributes` handles this).

## How to Use

Use at session closeout or milestone handoff.
