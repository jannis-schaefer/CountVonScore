---
name: resume-session
description: "Load project memory and summarize current context. Use when starting a new session or resuming after a pause to get current state, active plan, and next steps from committed docs."
user-invocable: true
---

# Resume Session

Load context and prepare branch/session state.

## When to Use

- Session start
- Session resume

## Procedure

1. Read:
   - `docs/ai/project-memory.md`
   - `docs/ai/current-plan.md`
   - `docs/ai/sessions/current-session.md`
2. Detect interrupted session and blockers.
3. Summarize current scope and next step.
4. Checkout/create feature branch:
   ```bash
   git checkout main && git pull
   git checkout -b feat/<slug>   # e.g. feat/compact-table-layout
   ```
5. Initialize `current-session.md`, commit, and push:
   ```bash
   git add docs/ai/sessions/current-session.md
   git commit -m "chore: start session - <brief intent>"
   git push
   ```
6. Start work and checkpoint early.

## How to Use

Use at the beginning of each implementation session.
