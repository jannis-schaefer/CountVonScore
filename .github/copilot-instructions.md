# Star Realms Counter — Copilot Instructions

Guidelines for all AI agents working on this repository.

## Memory & Context Workflow

All durable project memory lives in `docs/ai/`:
- **Read first**: `docs/ai/project-memory.md` for build commands, conventions, file structure
- **Then read**: `docs/ai/current-plan.md` for the active scope and next steps
- **Optional**: Latest file in `docs/ai/sessions/` if resuming after a break

When your session ends:
- Update `docs/ai/current-plan.md` with progress and any scope changes
- Add important decisions to `docs/ai/decision-log.md` (append-only)
- Create a dated note in `docs/ai/sessions/YYYY-MM-DD-hhmm.md` with completed work and next steps

## Codebase Essentials

**Build commands:**
```bash
npm run dev              # Start dev server
npm run build            # Production build
npx tsc --noEmit        # Check TypeScript
npm run generate-themes  # Regenerate theme registry
```

**Key principles** (see `docs/ai/project-memory.md` for details):
- React decides DOM structure; CSS decides visual layout
- Themes are CSS-based with auto-discovery; no manual registry updates
- Layouts are configured in `src/config/playerCardLayouts.ts`, rendered in `src/components/PlayerCardsLayout.tsx`, styled in `src/styles/layout.css`
- State lives in Zustand (`src/store/gameStore.ts`); display settings in React Context
- Always run `npx tsc --noEmit` and `npm run build` before committing

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

- **Planner** (`planner.agent.md`): Read memory, decompose features into steps, draft plans
- **Handoff** (`handoff.agent.md`): Update memory files at session closeout, capture decisions

## Conventions

- **TypeScript**: Strict mode, interfaces for props, React.FC<Props> pattern
- **React**: Functional components, hooks, clear prop types
- **CSS**: BEM-like naming (`.player-layout-*`, `.btn-*`), CSS variables for colors, `clamp()` for responsive
- **Commits**: Clear messages, incremental diffs, build must pass

## When Stuck

- Check `docs/ai/decision-log.md` for related decisions and rationale
- Check `docs/ai/sessions/` for notes on similar work
- Review `docs/ai/project-memory.md` for known patterns (adding layouts, themes, updating state)
