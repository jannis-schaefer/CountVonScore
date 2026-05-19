# Theme System Documentation

## Overview

The theme system is completely dynamic and self-discoverable. All CSS files in `src/styles/themes/` are automatically detected and registered. Adding a new theme is as simple as creating a CSS file with metadata comments.

## How It Works

1. **Theme Discovery**: The build script `scripts/generate-themes.mjs` scans `src/styles/themes/` for CSS files
2. **Metadata Extraction**: Each CSS file is parsed for theme metadata in comments
3. **Registry Generation**: A theme registry is automatically generated in `src/config/themes.ts`
4. **Runtime Loading**: The app loads all registered themes with no hardcoding needed

## Adding a New Theme (3 Simple Steps)

### Step 1: Create Theme CSS File

Create a new CSS file in `src/styles/themes/` with metadata comments at the top.

**Example: `src/styles/themes/neon.css`**

```css
/*!
 * @theme-id: neon
 * @theme-label: Neon
 * @theme-description: Cyberpunk-inspired neon theme
 */

.theme-neon {
  background-color: #0a0e27;
  color: #e0e0e0;
}

.theme-neon .btn {
  background-color: #00ff88;
  color: #000;
  border: 2px solid #00ff88;
}

.theme-neon .btn:hover {
  background-color: #00ffaa;
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

/* Add more theme-specific styles... */
```

### Step 2: Add Required Metadata Comments

Each theme CSS file **must** have these metadata comments at the very top to be recognized:

```css
/*!
 * @theme-id: unique_id_here
 * @theme-label: Display Name
 * @theme-description: Brief description
 */
```

**Metadata tags:**
- `@theme-id`: Unique identifier (required, used internally)
- `@theme-label`: Human-readable name (required, shown in Settings)
- `@theme-description`: Short description (optional, shown in dropdown)

### Required Theme Token Contract

Every theme must define these shared CSS variables somewhere in the file:

- `--primary-bg`
- `--primary-fg`
- `--secondary-bg`
- `--secondary-fg`
- `--accent-color`
- `--accent-hover`
- `--border-color`
- `--shadow`

If one or more are missing, the theme is ignored by the generator and not included in the app.

### Step 3: Generate and Done!

Run the theme generation script:

```bash
npm run generate-themes
```

Your new theme will automatically:
- Appear in the Settings → Theme dropdown
- Be selectable by users
- Persist when games are saved
- Work seamlessly with the app

## Theme CSS Structure

Every theme should define a `.theme-{id}` class and override component styles:

```css
/*!
 * @theme-id: mytheme
 * @theme-label: My Theme
 */

/* Define variables for your theme */
:root {
  --my-primary: #1a1a1a;
  --my-accent: #ff6b35;
  --my-text: #ffffff;
}

/* Main theme class */
.theme-mytheme {
  background-color: var(--my-primary);
  color: var(--my-text);
}

/* Override component styles */
.theme-mytheme .btn {
  background-color: var(--my-accent);
}

.theme-mytheme .btn:hover {
  background-color: #ff5520;
}

.theme-mytheme .card {
  background-color: var(--my-primary);
  border: 1px solid var(--my-accent);
}

.theme-mytheme .input {
  background-color: #2a2a2a;
  color: var(--my-text);
  border: 1px solid var(--my-accent);
}
```

## Essential Elements to Override

Every theme should style these components:

- `.btn` and `.btn:hover` - primary button
- `.btn-secondary` and hover state - secondary button
- `.card` - card backgrounds
- `.input` and `.input:focus` - form inputs
- `.modal-overlay` - dialog backgrounds
- `.text-muted` - secondary text color

## Build Integration

Theme generation runs automatically before every build:

```bash
npm run build  # Runs generate-themes → tsc → vite build
```

Validation behavior:
- Invalid theme files are skipped with warnings
- Build continues as long as at least one valid theme exists
- Build fails only if zero valid themes are found

To manually generate without building:

```bash
npm run generate-themes
```

## Current Themes

- **generic**: Clean, minimal dark/light theme with blue accents
- **starRealms**: Space-themed with purple/orange colors and sci-fi aesthetic

## Invalid Theme Behavior

Theme files are ignored if they:
- Miss required metadata (`@theme-id`, `@theme-label`)
- Reuse a duplicate `@theme-id`
- Miss one or more required shared tokens from the contract above

Ignored themes do not appear in Settings and are excluded from generated registry output.

## Troubleshooting

**Theme not appearing in Settings?**
1. Check file is in `src/styles/themes/`
2. Verify metadata comments are at the top of the file
3. Run `npm run generate-themes` manually
4. Check console for error messages

**Theme styles not applying?**
1. Verify `.theme-{id}` class selector matches theme ID exactly (case-sensitive)
2. Confirm file is under `src/styles/themes/` (App auto-loads `*.css` from this folder)
3. Verify metadata is correctly formatted
4. Use browser DevTools to confirm class is applied to `<html>` element

**Build errors after adding new theme?**
1. Run `npm run generate-themes` to update registry
2. Check for typos in metadata comments
3. Verify syntax of `.css` file
4. Run `npm run build` to rebuild


## Notes

- Do not edit `src/config/themes.ts` manually. It is generated.
- Do not manually register themes in TypeScript. Add a CSS file with metadata and run `npm run generate-themes`.
- Keep theme IDs stable once published to avoid breaking persisted settings.
