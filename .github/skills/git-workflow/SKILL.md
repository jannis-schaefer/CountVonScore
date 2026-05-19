---
name: git-workflow
description: "Commit and push changes to the remote repository. Use when completing any meaningful unit of work, reaching a checkpoint, or before ending a session. This workspace is transient — anything not pushed to remote will be lost."
user-invocable: true
argument-hint: "Describe what was completed in this checkpoint."
---

# Git Workflow

Create frequent focused commits and push when possible.

## Rules

1. Commit after each meaningful milestone.
2. Update `docs/ai/sessions/current-session.md` checkpoint log after milestone commits.
3. Keep commits scoped and use typed messages (`feat|fix|refactor|style|chore|wip`).
4. If upstream is missing, keep local commits and report `blocked-no-upstream`.

## Required Checks Before Pushing Code Changes

```bash
npm run lint
npx tsc --noEmit
npm run build
npm run test:integration
```

## Minimal Flow

```bash
git status --short
git add <relevant files>
git commit -m "<type>: <summary>"
git push
```
