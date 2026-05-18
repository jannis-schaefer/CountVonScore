---
name: resume-session
description: "Load project memory and summarize current context. Use when starting a new session or resuming after a pause to get current state, active plan, and next steps from committed docs."
user-invocable: true
---

# Resume Session

Rehydrate context and set up the working branch at the start of a session.

## When to Use

- Starting a new work session on this project
- Resuming after a break (hours, days, or longer)
- Picking up a task described in an issue or message

## Procedure

1. **Read project memory** — Load `docs/ai/project-memory.md`, `docs/ai/current-plan.md`, and `docs/ai/sessions/current-session.md`
2. **Check for interrupted session** — If `current-session.md` has content (not the empty template), an earlier session was interrupted. Read the checkpoint log and intent before proceeding.
3. **Summarize context** — Output a concise overview of:
   - Active plan scope and current step
   - What was last completed (from checkpoint log or latest dated session note)
   - Any known blockers
4. **Checkout or create a feature branch** — All work happens on branches, not main:
   ```bash
   git checkout main && git pull
   git checkout -b feat/<slug>   # e.g. feat/compact-table-layout
   ```
   If resuming an existing branch: `git checkout feat/<slug> && git pull`
5. **Initialize `current-session.md`** — Fill in the session intent, active step, and branch name, then commit and push immediately:
   ```bash
   git add docs/ai/sessions/current-session.md
   git commit -m "chore: start session - <brief intent>"
   git push
   ```
6. **Start work** — First checkpoint commit happens as soon as meaningful progress is made.

## What You'll See

```
## Context Loaded

### Active Plan
Title: Add Compact Table Layout
Scope: 4-player layout around device edges
Status: Not started
Next Step: Step 1 — Register layout in src/config/playerCardLayouts.ts

### Last Session
- Completed: Layout refactor (CSS consolidation)
- Remaining: None; ready for new work

### Current Session File
- Status: Empty template (no interrupted session)
- Branch to create: feat/compact-table-layout

### Ready to start. Branch created and session file initialized.
```

## How to Use

Type `/resume-session` in chat to invoke, or ask Copilot to use this skill at the start of any new task.
