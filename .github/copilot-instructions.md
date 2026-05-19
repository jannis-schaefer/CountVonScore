# Star Realms Counter — Copilot Instructions

Guidelines for all AI agents working on this repository.

## Critical: This Workspace Is Transient

> **Anything not pushed to the remote repository WILL be lost if the session ends unexpectedly.**
>
> Commit and push after every meaningful unit of work. Do not batch all commits to the end of a session.

## One-Time Setup (Run After Cloning)

```bash
git config merge.ours.driver true
```

This enables the `.gitattributes` merge rule that prevents session working notes from overwriting the clean template on main when feature branches are merged.

## Git Workflow

All work happens on feature branches, not directly on main:

```bash
git checkout main && git pull
git checkout -b feat/<slug>
# ... work, commit, push frequently ...
# When production-ready: merge to main, delete branch
```

**After every meaningful checkpoint:**
```bash
git add -A && git commit -m "<type>: <description>" && git push
```

If `git push` fails because no upstream/remote exists yet, warn and continue local commits for now. Retry push once upstream is configured.

**Before any push involving code changes:**
```bash
npm run lint              # Must be clean
npx tsc --noEmit          # Must be clean
npm run build             # Must succeed
npm run test:integration  # Must pass
```

See `.github/skills/git-workflow/SKILL.md` for full commit message conventions and branch workflow.

## Session Workflow

**At session start:**
1. Checkout or create a feature branch
2. Update `docs/ai/sessions/current-session.md` with intent and active step
3. Commit and push the session file immediately
4. Read `docs/ai/project-memory.md` and `docs/ai/current-plan.md`

**During work:**
- Update `docs/ai/sessions/current-session.md` checkpoint log after each commit
- Push every meaningful change; do not wait until session end

**At session end (or when production-ready):**
- Create a dated handoff note in `docs/ai/sessions/YYYY-MM-DD-hhmm.md`
- Update `docs/ai/current-plan.md` with progress
- Add decisions to `docs/ai/decision-log.md` if any were made
- Commit all changes and push
- Merge feature branch to main when ready to deploy

## Memory & Context Workflow

All durable project memory lives in `docs/ai/`:
- **Read first**: `docs/ai/project-memory.md` for build commands, conventions, file structure
- **Then read**: `docs/ai/current-plan.md` for the active scope and next steps
- **Check**: `docs/ai/sessions/current-session.md` if a session was interrupted
- **Optional**: Latest dated file in `docs/ai/sessions/` for prior session context

When your session ends:
- Write a dated handoff note in `docs/ai/sessions/YYYY-MM-DD-hhmm.md`
- Update `docs/ai/current-plan.md` with progress and any scope changes
- Add important decisions to `docs/ai/decision-log.md` (append-only)
- Commit and push all changes

## Codebase Essentials

**Build commands:**
```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # Lint checks
npm run test:integration # Smoke integration checks
npm run verify           # Full quality gate (lint + tsc + build + integration)
npx tsc --noEmit        # Check TypeScript
npm run generate-themes  # Regenerate theme registry
```

**Key principles** (see `docs/ai/project-memory.md` for details):
- React decides DOM structure; CSS decides visual layout
- Themes are CSS-based with auto-discovery; no manual registry updates
- Layouts are configured in `src/config/playerCardLayouts.ts`, rendered in `src/components/PlayerCardsLayout.tsx`, styled in `src/styles/layout.css`
- State lives in Zustand (`src/store/gameStore.ts`); display settings in React Context
- Always run lint + TypeScript + build + integration checks before merging

**File structure** (full details in `docs/ai/project-memory.md`):
- `src/store/gameStore.ts` — Game state
- `src/components/PlayerCard.tsx` — Single player card
- `src/components/PlayerCardsLayout.tsx` — Multi-layout renderer
- `src/pages/SharedDeviceMode.tsx` — Turn-based mode
- `src/pages/MultiplayerMode.tsx` — Individual tracking mode
- `src/styles/layout.css` — Layout & responsive
- `src/styles/themes/` — Theme CSS files (auto-discovered)

## Agent Roles

Custom agents are defined in `.github/agents/`:

- **SessionCoordinator** (`session-coordinator.agent.md`): User-facing orchestrator; delegates to specialist workers and decides next actions from returned evidence.
- **ContextLoader** (`context-loader.agent.md`): Loads project memory, interrupted state, and active branch context at session start.
- **TypeScriptImplementer** (`typescript-implementer.agent.md`): Implements app logic and component changes in TypeScript/React scope.
- **E2EImplementer** (`e2e-implementer.agent.md`): Implements and promotes Playwright E2E scenarios.
- **E2EFlakeTriage** (`e2e-flake-triage.agent.md`): Diagnoses flaky Playwright behavior and proposes deterministic stabilization actions.
- **CSSLayoutSpecialist** (`css-layout-specialist.agent.md`): Evaluates responsive/layout and theme-compatibility risks for style changes.
- **ZustandStateSpecialist** (`zustand-state-specialist.agent.md`): Reviews state semantics, selector stability, and persistence-contract safety.
- **CIWorkflowSpecialist** (`ci-workflow-specialist.agent.md`): Reviews workflow gate policy and CI risk/alignment before acceptance.
- **QualityGateRunner** (`quality-gate-runner.agent.md`): Runs lint/typecheck/build/integration/E2E verification gates and reports blockers.
- **GitCheckpointWorker** (`git-checkpoint-worker.agent.md`): Creates focused git checkpoints and records session log updates.
- **Handoff** (`handoff.agent.md`): Updates memory files at session closeout and captures decisions.

All agents support per-run tuning:
- Model can be selected at invocation time.
- Reasoning depth can be selected at invocation time (`low`, `medium`, `high`).
- Agent model preferences belong in each agent frontmatter `model` field.
- Reasoning depth is instruction-level guidance, not a frontmatter key.

Reasoning policy ownership split:
- `SessionCoordinator` owns runtime reasoning defaults by worker, escalation rules, and retry/reroute policy.
- Worker agents own domain-specific guidance on what higher reasoning should focus on in that domain.
- Coordinator policy is the canonical source when coordinator and worker guidance differ.

Model selection policy:
- Cost-aware model assignment and escalation triggers are documented in `docs/ai/model-selection.md`.
- Re-evaluate defaults when pricing tiers or available models materially change.

## Conventions

- **TypeScript**: Strict mode, interfaces for props, React.FC<Props> pattern
- **React**: Functional components, hooks, clear prop types
- **CSS**: BEM-like naming (`.player-layout-*`, `.btn-*`), CSS variables for colors, `clamp()` for responsive
- **Commits**: Clear messages, incremental diffs, build must pass

## When Stuck

- Check `docs/ai/decision-log.md` for related decisions and rationale
- Check `docs/ai/sessions/` for notes on similar work
- Review `docs/ai/project-memory.md` for known patterns (adding layouts, themes, updating state)
