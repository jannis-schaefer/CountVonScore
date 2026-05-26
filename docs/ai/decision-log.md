# Decision Log — Star Realms Counter

Durable decisions and design rationale. Append-only; never remove entries.

## Format

```
### YYYY-MM-DD: [Decision Title]

**Context**: [Why was this decision needed? What problem or opportunity?]

**Decision**: [What was chosen?]

**Rationale**: [Why this option over alternatives?]

**Impact**: [What changed as a result? Related components, future implications?]
```

---

## Entries

### 2026-05-19: Theme Contract Enforcement With Skip-Invalid Build Behavior

**Context**: Theme contributions could break runtime styling due to missing shared tokens or malformed metadata. Manual review alone was not enough to prevent bad themes from entering generated registry output.

**Decision**:
- Enforce a required token contract in theme generation (`--primary-bg`, `--primary-fg`, `--secondary-bg`, `--secondary-fg`, `--accent-color`, `--accent-hover`, `--border-color`, `--shadow`)
- Require metadata (`@theme-id`, `@theme-label`) and reject duplicates
- Ignore invalid themes with warnings instead of failing the whole build, unless zero valid themes remain

**Rationale**:
- Keeps frontend development stable by ensuring every loaded theme exposes expected shared variables
- Prevents one bad theme contribution from breaking the full pipeline
- Preserves contributor autonomy while protecting app runtime quality

**Impact**:
- Updated `scripts/generate-themes.mjs` with validation and skip logic
- Updated theme docs in `THEME_DEVELOPMENT.md`
- Updated `src/styles/themes/starRealms.css` to define required shared tokens

### 2026-05-19: Release E2E Strategy (Required A/B, Optional C, No Schedule)

**Context**: Need browser-level regression protection while controlling CI runtime costs on free GitHub Actions limits.

**Decision**:
- Required E2E release gate includes only flows A and B
- Flow C (settings/default-theme roundtrip) is optional/manual regression
- No scheduled E2E run
- Optional regression remains manually invokable via workflow_dispatch

**Rationale**:
- Required suite stays fast and focused on highest-value gameplay paths
- Optional regression enables deeper checks on demand without continuous cost
- Avoids unnecessary CI complexity

**Impact**:
- Added Playwright config and required/optional test suites under `e2e/`
- Added release workflow in `.github/workflows/e2e-release.yml`
- Added npm scripts for required and optional E2E execution

### 2026-05-19: Prioritize Lint QA As First Official Session

**Context**: Current lint failures prevent the agreed quality gate (`npm run verify`) from being a reliable release criterion and can block feature delivery.

**Decision**:
- Make lint QA pass the first official implementation session
- Keep current strict merge expectation (lint + typecheck + build + integration), but sequence work to clear lint debt first

**Rationale**:
- Restores trust in the verify pipeline
- Prevents recurring context-switch cost where feature work is blocked by baseline lint debt
- Aligns with user preference to prioritize lint QA if lint blocks progress

**Impact**:
- New 15-step Session 1 plan in `docs/ai/current-plan.md`
- Session intent should start with lint baseline cleanup before additional regression expansion

### 2026-05-18: Establish Repo-Wide Agent & Memory Setup

**Context**: Need a structured way for AI agents and future work sessions to read and update shared project context without cluttering the main codebase.

**Decision**: 
- Use repo-shared Copilot customization under `.github/` and `docs/ai/`
- Durable memory lives in committed docs (plans, decisions, summaries)
- Ephemeral work stays in native session memory, not committed
- No user-local agent variants; all agents and skills are shared workspace-wide

**Rationale**: 
- Committed memory ensures future agents and contributors see the same source of truth
- Separating durable from ephemeral avoids cluttering git history with chat transcripts
- Shared workspace agents keep the team/agent experience consistent
- Repo is single-project and doesn't need cross-workspace customization

**Impact**: 
- Added `.github/copilot-instructions.md` as the always-on agent guidance
- Created `docs/ai/` for shared memory (project-memory, current-plan, decision-log, sessions/)
- Custom agents (planner, handoff) read these files and update them as needed
- Session handoff notes are concise summaries, not full transcripts

### 2026-04-28: Refactor Layout Component and CSS for Clarity

**Context**: Layout component had multiple confusing `if layoutId ===` branches, and CSS had significant duplication of flex/scroll rules.

**Decision**: 
- Consolidate layout rendering into three clear paths: linear, grid, table
- Create a LINEAR_LAYOUTS config map for seatRail and minimalist shared DOM patterns
- Merge duplicated CSS selectors (e.g., combine `.player-layout-seat-rail` and `.player-layout-scroll` base rules)
- Remove unused `.tabletop-grid-landscape` class; use media queries on `.tabletop-grid` instead

**Rationale**: 
- Reduces cognitive load for future layout additions
- Makes it easier to reason about which layout uses which structure
- CSS consolidation reduces maintenance and bundle size
- Clear branching logic is easier to extend

**Impact**: 
- `src/components/PlayerCardsLayout.tsx` now has ~160 lines vs. 200+ (clearer structure)
- `src/styles/layout.css` shed ~30 lines of duplication
- No behavior change; same visual output, cleaner code

### 2026-04-28: Auto-Focus Current Player on Turn Navigation, Decoupled from Counter Editing

**Context**: Users wanted auto-scroll to the current player when changing turns, but focus was being triggered on every counter value change, stealing focus from inputs.

**Decision**: 
- Add `focusKey` prop that includes turn state (not counter edit state)
- Add `enableAutoFocus` toggle in display settings
- Use `requestAnimationFrame` + `scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })`
- Set `preventScroll: true` on `focus()` to suppress secondary browser auto-scroll

**Rationale**: 
- Turn navigation is rare; counter editing is frequent. Decoupling prevents focus theft.
- smooth scrolling is more polished than jump scrolling
- Nearest centering keeps off-screen content accessible
- preventScroll avoids jitter from double-scroll

**Impact**: 
- `src/components/PlayerCardsLayout.tsx` includes focus effect triggered by focusKey
- `src/context/PlayerCardLayoutContext.tsx` stores autoFocusEnabled toggle
- `src/pages/SharedDeviceMode.tsx` passes `activePlayerId` and `focusKey` to layout
- Users can disable auto-focus in Settings if they prefer manual control

### 2026-04-28: Dynamic Theme System with CSS Metadata Discovery

**Context**: Adding themes required manual registry updates, which was error-prone and didn't scale.

**Decision**: 
- Themes are CSS files in `src/styles/themes/` with metadata comments
- `scripts/generate-themes.mjs` scans CSS, extracts metadata, generates `src/config/themes.ts`
- Theme registry is auto-generated before build; never edited manually

**Rationale**: 
- CSS-as-source-of-truth is simpler than duplicating metadata in TypeScript
- Auto-generation prevents registry/CSS drift
- Adding a new theme requires only one new CSS file; no code changes

**Impact**: 
- `src/config/themes.ts` is generated, not manually maintained
- `scripts/generate-themes.mjs` runs before TypeScript compilation
- New themes just need a CSS file with metadata comments
- Type-safe theme registry still generated correctly

### 2026-05-19: Coordinator Owns Runtime Policy (Reasoning + Escalation)

**Context**: Worker instructions were accumulating orchestration-style runtime rules, causing duplicated guidance and drift across files.

**Decision**:
- Keep runtime reasoning defaults, retries, reroutes, and escalation policy in `SessionCoordinator`
- Keep worker files focused on domain execution guidance
- Treat coordinator runtime policy as canonical when worker guidance conflicts

**Rationale**:
- Centralizing runtime policy improves consistency and observability during smoke tests
- Workers remain simpler and easier to maintain when they only describe domain behavior
- Retry/escalation logic belongs to the orchestrator that owns delegation outcomes

**Impact**:
- Coordinator now defines per-worker reasoning defaults and escalation rules
- Central instructions document policy ownership split
- Worker runtime duplication was removed in favor of a single control plane

### 2026-05-19: Cost-Aware Model Matrix With Escalation-Only High-Cost Models

**Context**: Available models differ substantially in token cost tiers, so unconstrained model selection risks unnecessary spend.

**Decision**:
- Use 1x-tier models as defaults for high-value workers
- Use free-tier model for deterministic procedural workers
- Reserve `Claude Opus 4.6` (3x) for escalation after repeated failures on high-impact blockers
- Keep `Claude Opus 4.7` opt-in only at current pricing

**Rationale**:
- Quality gains from highest-cost models are typically sublinear for routine tasks
- Escalation-only usage preserves quality headroom without paying premium cost by default
- A fixed matrix improves reproducibility and makes future re-evaluation explicit

**Impact**:
- Added `docs/ai/model-selection.md` with defaults, escalation rules, and re-evaluation triggers
- Coordinator references the model matrix as runtime policy
- Session closeout now includes model-policy maintenance as durable memory

### 2026-05-26: Minimal Accessibility QA Policy Linked Into Verification Flows

**Context**: Session verification coverage needed a lightweight, explicit accessibility checkpoint aligned with existing smoke and layout validation workflows.

**Decision**:
- Adopt a minimal accessibility QA policy as a documented closeout requirement
- Link the policy from quality-gate-runner documentation and CSS layout flow documentation
- Keep scope lightweight so it complements existing smoke gates instead of replacing them

**Rationale**:
- Establishes a consistent baseline accessibility check without adding heavy process overhead
- Reduces drift by binding the policy to the existing verification paths that contributors already follow
- Improves release confidence for UI/layout changes where accessibility regressions can be subtle

**Impact**:
- Accessibility QA expectation is now explicitly represented in session closeout evidence
- Quality-gate-runner and CSS flow documentation now point to the same minimal policy baseline
- Integration and MCP smoke evidence can be reported alongside accessibility policy compliance

---

**Next Entry**: Add below when a significant decision is made.
