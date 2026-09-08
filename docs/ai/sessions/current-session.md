# Current Session

> This file is reset at the start of each session branch.
> Main branch always keeps this empty template (protected via .gitattributes merge=ours).


**Branch**: main
**Started**: 2026-09-08
**Agent/Contributor**: Copilot + User

## Session Intent

Repair README guidance, verify Playwright MCP visual feedback, and adapt the four-player tabletop layout for flat-table phone and tablet use.

## Active Step

Verify Playwright MCP availability with a four-player `tabletopRotated` baseline screenshot.

## Checkpoint Log

2026-09-08 - New session opened; stale completion state replaced with repository-reconciliation TODOs.
2026-09-08 - Git reconciliation complete: `main` matches `origin/main` at `2671994`; backlog triaged.
2026-09-08 - Docs-only checkpoint committed for the new backlog-triage session plan.
2026-09-08 - README repair completed; focused lint validation blocked because `npm` is unavailable in the current shell.
2026-09-08 - Session scope set to Playwright MCP verification and four-player flat-table layout review.
2026-09-08 - Checkpoint: README repair and tabletop layout session plan committed; npm validation remains blocked and Playwright MCP is not registered in this chat session.

## TODOs

- [x] Verify branch, worktree, remote, latest commit, and `origin/main..HEAD`.
- [x] Decide whether unpublished commits belong on `main` or need branch handling.
- [x] Repair README setup/lint guidance and remove its appended ESLint fragment.
- [ ] Restore Node.js/npm availability in the shell if needed for MCP and validation commands.
- [ ] Prove Playwright MCP availability by capturing a four-player `tabletopRotated` baseline screenshot.
- [ ] Review four-edge placement, rotations, controls, and tablet landscape behavior.
- [ ] Apply the smallest tablet layout adjustment required by screenshot evidence.
- [ ] Capture and review post-change MCP screenshots.
- [ ] Run responsive, theme, touch, and required automated validation.
- [ ] Commit and push through `GitCheckpointWorker`.
- [ ] Run `Handoff` with read-only Git status/diff evidence.

## QA Status

- README lint verification blocked: `npm` is not available in the current shell.
- Layout validation is pending Playwright MCP availability.

## Remote / Push Status

- `main` matched `origin/main` at `86267df` after the backlog-triage checkpoint.

## Blockers / Notes

- Historical threshold behavior remains blocked pending a product decision. Node.js/npm availability is required to run the configured `npx @playwright/mcp@latest` server and repository validation scripts.
