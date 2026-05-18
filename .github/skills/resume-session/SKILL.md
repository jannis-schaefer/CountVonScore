---
name: resume-session
description: "Load project memory and summarize current context. Use when starting a new session or resuming after a pause to get current state, active plan, and next steps from committed docs."
user-invocable: true
---

# Resume Session

Rehydrate your context from committed project memory.

## When to Use

- Starting a new work session on this project
- Resuming after a break (hours, days, or longer)
- Picking up a task described in an issue or message

## Procedure

1. **Load project memory** — Run this skill to fetch `docs/ai/project-memory.md`, `docs/ai/current-plan.md`, and the latest session note
2. **Review summary** — Skill outputs a concise overview of:
   - Project basics (tech stack, structure)
   - Build commands and verification checklist
   - Current plan scope and next steps
   - Latest session progress and blockers
3. **Ask for direction** — Skill asks: "What's the goal for this session? Continue the current plan, start new work, or investigate a bug?"
4. **Proceed** — You're now ready to start work with full context

## What You'll See

The skill outputs something like:

```
## Project Context Loaded

### Project Basics
- Star Realms Counter: PWA for multiplayer card game tracking
- Tech: React 19, TypeScript, Vite, Zustand, CSS themes
- Build: npm run dev, npm run build, npx tsc --noEmit

### Current Plan Status
**Title**: Add Compact Table Layout
**Scope**: 4-player layout positioned around device edges
**Status**: Not started
**Next Step**: Register layout in src/config/playerCardLayouts.ts

### Latest Session (2026-05-18 16:30)
- Completed: Layout refactor for code clarity
- Remaining: None (prior session done)
- Recommended: Start new compact-table layout work

### Next Action for You
What's your goal?
1. Continue the current plan
2. Start new work (describe it)
3. Review or fix something specific
```

## How to Use

Type `/resume-session` in chat to invoke, or ask a human agent to use this skill when onboarding to a new task.
