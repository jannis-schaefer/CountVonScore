# Project Memory — Star Realms Counter

Stable project facts, conventions, architecture, and commands for agent reference.

## Project Overview

**Star Realms Counter** is a PWA (Progressive Web App) for tracking multi-player game state in the turn-based card game Star Realms. Built with React 19, TypeScript, Vite, and Zustand.

- Single-device shared-turn mode and individual multiplayer mode
- Dynamic theme system with CSS metadata discovery
- Flexible player card layouts (grid, tabletop, minimalist, seatRail)
- 50-action history and undo support
- Service worker for offline play
- Installable on any device

## Key Technologies

| Layer | Tech |
|-------|------|
| UI framework | React 19 |
| Type safety | TypeScript (strict mode) |
| Build | Vite |
| State | Zustand (store in `src/store/gameStore.ts`, ~1085 lines) |
| Styling | CSS (themes in `src/styles/themes/`) |
| Routing | React Router (HashRouter) |
| Persistence | localforage |
| PWA | Service Worker (`public/sw.js`) |

## Build & Commands

```bash
npm install              # Install dependencies

npm run dev              # Start dev server (http://localhost:5173)
npm run build            # Production build
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run generate-themes  # Regenerate theme registry (auto-run on build)
npm run test:integration # Store-level smoke + behavioral checks
npm run test:e2e:required # Required browser flows (A + B)
npm run test:e2e:regression # Optional browser regression flows
npm run verify           # Full quality gate (lint + tsc + build + integration)
```

On Windows, use helper scripts: `.\dev.ps1`, `.\build.ps1`

## File Structure

```
src/
├── store/gameStore.ts           # Zustand state (players, counters, history, turns)
├── context/
│   ├── ThemeContext.tsx         # Theme provider + selection
│   └── PlayerCardLayoutContext.tsx  # Layout selection + persistence
├── components/
│   ├── PlayerCard.tsx           # Single player card rendering
│   ├── PlayerCardsLayout.tsx    # Multi-layout renderer (grid, tabletop, minimalist, seatRail)
│   ├── Modal.tsx, Dialog.tsx    # UI overlays
│   └── ...
├── pages/
│   ├── SharedDeviceMode.tsx     # Turn-based gameplay
│   ├── MultiplayerMode.tsx      # Individual player tracking
│   ├── Settings.tsx             # Config: counters, players, theme, layout, import/export
│   └── Home.tsx                 # Mode selection
├── styles/
│   ├── layout.css               # Layout positioning + responsive
│   ├── global.css               # Typography, colors, resets
│   └── themes/                  # Theme CSS files (auto-discovered)
└── main.tsx, App.tsx            # Entry point + root shell

public/
├── manifest.json                # PWA metadata
└── sw.js                        # Service worker
```

## Architecture Decisions

### Rendering vs. CSS Separation
- **React** decides what HTML elements exist (structure, data flow, state)
- **CSS** decides where/how those elements appear visually (layout, positioning, rotation)
- Same DOM structure can produce different visual layouts with CSS-only changes

### Theme System
- Themes are **CSS-based**, not component-driven
- CSS files in `src/styles/themes/` are auto-discovered via `scripts/generate-themes.mjs`
- Metadata (@theme-id, @theme-label, @theme-description) in CSS comments
- Registry auto-generated to `src/config/themes.ts` before build
- Required shared token contract enforced by generator
- Invalid themes are skipped with warnings; build fails only if zero valid themes remain
- No manual registry updates needed

### Automated Testing Strategy
- Integration checks run at store/pipeline level via `npm run test:integration`
- Browser E2E runs on Playwright with minimal required release gate:
	- Required: flow A (core gameplay) and flow B (resume/reload)
	- Optional/manual: flow C and drafted turn-navigation regressions
- Release workflow uses required suite only; optional regressions are run on demand

### Layout System
- **Layout registry** in `src/config/playerCardLayouts.ts` (5 presets: grid, tabletop, tabletopRotated, minimalist, seatRail)
- **Layout renderer** in `src/components/PlayerCardsLayout.tsx` (shared rendering logic for linear and table-based layouts)
- **Layout styling** in `src/styles/layout.css` (all positioning and responsive behavior)
- **Layout context** in `src/context/PlayerCardLayoutContext.tsx` (selection + localStorage persistence)
- Active-player auto-focus on turn navigation (no focus during editing)
- CSS clamp() for responsive card sizing

### State Management
- **Zustand store** for game state (players, counters, history, turn tracking)
- **React Context** for display preferences (theme, layout, autofocus toggle)
- **localStorage** via localforage for persistence
- No Redux or complex async middleware

### Agent Workflow Baseline
- `SessionCoordinator` is the single orchestration control plane for delegation, retries, reroutes, and completion decisions
- Runtime policy (reasoning depth defaults, escalation behavior, model selection by worker) is coordinator-owned
- Worker agents are domain specialists and should avoid duplicating orchestration policy
- Cost-aware model defaults and escalation triggers are documented in `docs/ai/model-selection.md`
- High-cost models are escalation-only unless explicitly approved for a run

## Conventions

### TypeScript
- Strict mode enabled
- Interfaces for component props
- Type-safe store with Zustand

### React
- Functional components + hooks only
- Props interfaces for clarity
- React.FC<Props> type annotation pattern

### CSS
- BEM-like naming: `.player-layout-*`, `.card-*`, `.btn-*`
- CSS variables for theme colors (--primary-bg, --secondary-bg, --accent-color, etc.)
- clamp() for fluid responsive sizing
- Scroll-snap for layout-agnostic smooth scrolling

### Git & Commits
- Clear, concise commit messages (e.g., "Refactor layout component and CSS")
- Incremental refactors to keep diffs reviewable
- Build must pass before committing
- Commit and push after each meaningful checkpoint; do not wait until session end

## Known Patterns

### Adding a New Layout
1. Register it in `src/config/playerCardLayouts.ts`
2. Add a render branch in `src/components/PlayerCardsLayout.tsx` (or reuse linear layout config)
3. Add CSS rules in `src/styles/layout.css`
4. Test in Settings

### Adding a New Theme
1. Create a CSS file in `src/styles/themes/` with metadata comments
2. Run `npm run generate-themes`
3. Theme auto-appears in Settings

### Updating State
- Import `useGameStore()` in any component
- Call store methods directly (no async action creators needed)
- Store auto-persists to localforage

## Common Build Issues

- **Node/npm PATH**: Use `.\dev.ps1` or `.\npm-wrapper.ps1` helper scripts on Windows
- **Theme registry out of sync**: Run `npm run generate-themes` before build
- **TypeScript errors**: Run `npx tsc --noEmit` to check before committing

## Verification Checklist

Before committing:
- [ ] `npm run lint` passes (or QA baseline explicitly in progress)
- [ ] `npx tsc --noEmit` passes (no TypeScript errors)
- [ ] `npm run build` succeeds
- [ ] `npm run test:integration` passes
- [ ] `npm run test:e2e:required` passes when gameplay/UI behavior changed
- [ ] Browser dev tools show no console errors
- [ ] Feature works in target game mode (Shared Device or Multiplayer)
