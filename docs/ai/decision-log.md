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

---

**Next Entry**: Add below when a significant decision is made.
