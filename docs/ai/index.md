# AI & Agent Memory Index

This folder contains shared Copilot instructions, durable project memory, and session handoff notes for all agents working on Star Realms Counter.

## Quick Navigation

- **[Project Memory](./project-memory.md)** — Stable conventions, architecture, build commands, key file locations
- **[Current Plan](./current-plan.md)** — Active project plan with scope, steps, and verification
- **[Decision Log](./decision-log.md)** — Durable decisions and design rationale (append-only)
- **[Model Selection](./model-selection.md)** — Cost-aware model defaults, escalation rules, and re-evaluation triggers
- **[Sessions](./sessions/)** — Dated handoff notes from previous work sessions

## For New Sessions

1. Read `project-memory.md` for repo conventions and commands
2. Read `current-plan.md` to understand the active scope
3. Check the latest file in `sessions/` if resuming from a pause
4. Work on the current plan; if you change scope or decisions, document it

## For Session Closeout

1. Update `current-plan.md` with progress and any scope changes
2. If you made important decisions, add them to `decision-log.md`
3. Create a dated note in `sessions/YYYY-MM-DD-hhmm.md` with:
   - What was completed or attempted
   - What remains to do
   - Any blockers or open questions
   - Next recommended steps

## Agent Roles

- **Planner** (`.github/agents/planner.agent.md`) — Reads this memory and drafts/revises plans
- **Handoff** (`.github/agents/handoff.agent.md`) — Updates memory files at session closeout
- **Resume Session** skill — Rehydrates context from these files at session start

See `.github/copilot-instructions.md` for the full agent guidance and memory workflow.
