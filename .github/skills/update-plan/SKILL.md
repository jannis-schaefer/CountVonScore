---
name: update-plan
description: "Revise or create docs/ai/current-plan.md with new scope, steps, and verification. Use when refining the active plan, changing scope mid-session, or starting entirely new work."
user-invocable: true
argument-hint: "Describe the plan update or new plan needed."
---

# Update Plan

Revise the current work plan in `docs/ai/current-plan.md`.

## When to Use

- Starting new work and need a formal plan to track scope
- Midway through a task, scope has changed (add steps, remove steps, etc.)
- Finishing the current plan and need to pivot to the next task
- Reviewing a plan and want to clarify steps or verification

## Procedure

1. **Describe the change** — Tell this skill:
   - "Start a new plan for [feature/fix]"
   - "Refine the current plan: [specific changes]"
   - "Archive the current plan; start a new one for [next task]"
2. **Review the draft** — Skill outputs a proposed plan with scope, steps, verification, and rationale
3. **Approve or iterate** — You can ask for changes (add a step, change a title, clarify verification)
4. **Commit** — Skill writes the final plan to `docs/ai/current-plan.md`

## Plan Template

The skill uses this structure:

```markdown
# Current Plan — [Title]

**Status**: [In progress / Blocked / Ready for review]  
**Started**: YYYY-MM-DD  
**Target Completion**: YYYY-MM-DD

## Scope

[What are we building/fixing? Why? Who benefits?]
[Related systems or constraints?]

## Steps

1. [Step name] — Brief description
2. [Step name] — Brief description
...

## Verification

How do we know this is done?
- [ ] Verification point 1
- [ ] Verification point 2
- [ ] TypeScript check passes
- [ ] Build succeeds
- [ ] Feature works as expected

## Dependencies / Blockers

[Any other issues, PRs, or prerequisites?]

## Decision Rationale

[Why this approach instead of alternatives? Key design decisions.]
```

## Example Usage

**User**: `update-plan: Refine the compact table layout plan. Add a step for testing responsive behavior on landscape mode.`

**Skill output**:
```
## Proposed Plan Update

**Title**: Add Compact Table Layout

**Current Steps**:
1. Register layout in src/config/playerCardLayouts.ts
2. Add render branch in src/components/PlayerCardsLayout.tsx
3. Add CSS rules in src/styles/layout.css
4. Test in Settings on mobile and desktop

**Proposed addition**:
4a. Test landscape mode on phones (rotate device, verify spacing)

**Updated verification**:
- [ ] Compact table layout appears in Settings
- [ ] Cards position around edges, minimal negative space
- [ ] Responsive: works on phone (portrait + landscape), tablet, desktop
- [ ] Turn navigation focuses current player
- [ ] TypeScript check passes
- [ ] Build succeeds

**Ready to commit this plan?** (yes/no/refine)
```

## How to Use

Type `/update-plan [brief description]` in chat, or ask the Planner agent to use this skill when refining scope.
