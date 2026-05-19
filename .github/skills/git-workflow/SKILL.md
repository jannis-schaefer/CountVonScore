---
name: git-workflow
description: "Commit and push changes to the remote repository. Use when completing any meaningful unit of work, reaching a checkpoint, or before ending a session. This workspace is transient — anything not pushed to remote will be lost."
user-invocable: true
argument-hint: "Describe what was completed in this checkpoint."
---

# Git Workflow

Commit and push every meaningful checkpoint to the remote repository.

## Critical Rule

> **This workspace is transient. Anything not pushed to the remote WILL be lost if the session ends.**
>
> Commit and push frequently — after every meaningful unit of work, not just at session end.

## When to Use

- After completing any step in `docs/ai/current-plan.md`
- After fixing a bug or making a verifiable change
- Before switching tasks or taking a break
- Any time work would be painful to redo if lost
- Before ending a session (required)

## Procedure

### Standard Checkpoint Commit

```bash
# 1. Check what changed
git status

# 2. Stage all relevant changes (or stage specific files)
git add -A

# 3. Commit with a clear, descriptive message
git commit -m "<type>: <concise description>"

# 4. Push to remote immediately
git push

# 5. Update docs/ai/sessions/current-session.md checkpoint log
# Append: YYYY-MM-DD HH:MM — [what was completed]
git add docs/ai/sessions/current-session.md
git commit -m "chore: update session checkpoint"
git push
```

If `git push` fails because upstream/remote is not configured yet:
- Warn that remote backup is unavailable
- Continue with local commits (do not block session work)
- Retry push after upstream is configured

### Commit Message Format

Use a short type prefix followed by a clear description:

| Type | When to Use |
|------|-------------|
| `feat:` | New feature or capability |
| `fix:` | Bug fix |
| `refactor:` | Code cleanup, no behavior change |
| `style:` | CSS/formatting only |
| `chore:` | Tooling, config, docs, dependency updates |
| `wip:` | Work in progress (mid-step checkpoint) |

Examples:
- `feat: add compact-table layout for 4-player mode`
- `fix: correct auto-focus triggering on counter edit`
- `refactor: consolidate linear layout render paths`
- `chore: update session checkpoint`
- `wip: step 2/4 - add render branch (incomplete)`

### Before Ending a Session

Always do a final push before closing:

```bash
git status                    # Check for any unstaged changes
git add -A
git commit -m "chore: session end checkpoint"
git push
```

Then use the `/capture-handoff` skill to archive the session and update memory.

## Branch Workflow

All work happens on feature branches, not directly on main:

```bash
# Start a new session
git checkout main
git pull                      # Ensure main is up to date
git checkout -b feat/<slug>   # e.g. feat/compact-table-layout

# After work is production-ready and checkpoints are merged:
git checkout main
git merge feat/<slug>
git push
git branch -d feat/<slug>
```

## One-Time Repository Setup

After cloning this repository, run once:

```bash
git config merge.ours.driver true
```

This enables the `.gitattributes` merge strategy that protects `docs/ai/sessions/current-session.md` on main from being overwritten by session-specific content when feature branches are merged.

## Verify Before Any Push

Before pushing code changes (not session notes), always verify:

```bash
npm run lint              # Lint must be clean
npx tsc --noEmit          # TypeScript must be clean
npm run build             # Build must succeed
npm run test:integration  # Integration smoke checks must pass
```

Do not push if either check fails.

## Quick Reference

```bash
# Checkpoint push (during work)
git add -A && git commit -m "wip: <description>" && git push

# Feature push (after full verification)
npm run verify && git add -A && git commit -m "feat: <description>" && git push
```
