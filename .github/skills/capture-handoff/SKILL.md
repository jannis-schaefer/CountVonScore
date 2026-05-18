---
name: capture-handoff
description: "Summarize completed work and update durable memory at session end. Use for writing session notes, recording decisions, and closing out or advancing the current plan."
user-invocable: true
argument-hint: "Briefly describe what was completed in this session."
---

# Capture Handoff

Write session summary and update project memory at session closeout.

## When to Use

- Ending a work session (even if work isn't finished)
- Completing a planned task and moving to the next one
- Making important decisions that should be recorded
- Handing off to another person or future session

## Procedure

1. **Provide session summary** — Tell this skill:
   - What was completed
   - What remains (if task isn't done)
   - Any blockers or unknowns
   - Key decisions made (if any)

2. **Skill generates** three updates:
   - **Dated session note** in `docs/ai/sessions/YYYY-MM-DD-hhmm.md`
   - **Updated plan** in `docs/ai/current-plan.md` (status, progress)
   - **New decision entries** in `docs/ai/decision-log.md` (if decisions were made)

3. **Review** — Skill shows you the proposed updates and asks to confirm

4. **Commit** — Skill writes the final updates to git-tracked files

## Session Note Template

The skill writes notes like:

```markdown
# Session: [Brief Title]

**Date**: YYYY-MM-DD HH:MM  
**Duration**: ~X hours

## Completed

- [What was accomplished?]
- [What changed from original plan?]
- [What was tested or verified?]

## Remaining / Blockers

- [What still needs to be done?]
- [Any blockers or unknowns?]

## Key Decisions Made

- [Brief note; detailed decisions go in decision-log.md]

## Next Steps

1. [Recommended first action]
2. [Follow-up action if first isn't complete]

## Verification

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] Relevant features tested in browser
```

## Decision Log Entry Template

If you made decisions, skill adds to `docs/ai/decision-log.md`:

```markdown
### YYYY-MM-DD: [Decision Title]

**Context**: [Why was this decision needed?]

**Decision**: [What was chosen?]

**Rationale**: [Why this over alternatives?]

**Impact**: [What changed as a result?]
```

## Example Usage

**User**: `capture-handoff: Completed the layout refactor. Consolidated linear layouts, merged CSS, removed unused classes. No behavior changes. Ready for next feature.`

**Skill output**:
```
## Session Summary Generated

### Session Note (docs/ai/sessions/2026-05-18-1630.md)
- Date: 2026-05-18 16:30
- Completed: Layout component refactor, CSS consolidation
- Remaining: None (task complete)
- Next: Start new feature work

### Plan Update (docs/ai/current-plan.md)
- Status: Changed to "Complete"
- Archive suggested: docs/ai/archive/plans/2026-05-18-layout-refactor.md

### Decisions Recorded
- Added 1 decision to decision-log.md (Linear layout consolidation)

**Ready to write these updates to git?** (yes/no/refine)
```

## How to Use

Type `/capture-handoff [summary]` in chat at session end, or ask the Handoff agent to use this skill when you're ready to close out.
