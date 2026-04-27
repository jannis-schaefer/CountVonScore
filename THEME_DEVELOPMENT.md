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

To manually generate without building:

```bash
npm run generate-themes
```

## Current Themes

- **generic**: Clean, minimal dark/light theme with blue accents
- **starRealms**: Space-themed with purple/orange colors and sci-fi aesthetic

## Fallback Behavior

If a CSS file lacks proper metadata comments, the filename becomes the theme ID:
- File: `mystyle.css` → Theme ID: `mystyle`, Label: `Mystyle`
- This works but lacks a description in the dropdown

## Troubleshooting

**Theme not appearing in Settings?**
1. Check file is in `src/styles/themes/`
2. Verify metadata comments are at the top of the file
3. Run `npm run generate-themes` manually
4. Check console for error messages

**Theme styles not applying?**
1. Verify `.theme-{id}` class selector matches theme ID exactly (case-sensitive)
2. Check CSS file is imported in `src/App.tsx`
3. Verify metadata is correctly formatted
4. Use browser DevTools to confirm class is applied to `<html>` element

**Build errors after adding new theme?**
1. Run `npm run generate-themes` to update registry
2. Check for typos in metadata comments
3. Verify syntax of `.css` file
4. Run `npm run build` to rebuild


```css
/* Neon Theme */
:root {
  --neon-primary: #0a0e27;
  --neon-accent: #00ff88;
  --neon-accent-light: #00ffaa;
  --neon-text: #e0e0e0;
  --neon-border: #00ff88;
}

.theme-neon {
  background-color: var(--neon-primary);
  color: var(--neon-text);
}

.theme-neon .btn {
  background-color: var(--neon-accent);
  color: #000;
  border: 2px solid var(--neon-accent);
  font-weight: 600;
}

.theme-neon .btn:hover {
  background-color: var(--neon-accent-light);
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.theme-neon .btn-secondary {
  background-color: var(--neon-primary);
  color: var(--neon-text);
  border: 2px solid var(--neon-border);
}

.theme-neon .btn-secondary:hover {
  background-color: var(--neon-border);
  color: #000;
}

/* Add more theme-specific overrides as needed */
```

### Step 2: Register Theme in Theme Config

Open `src/config/themes.ts` and add your theme:

```typescript
export const THEMES: Record<string, ThemeDefinition> = {
  generic: {
    id: 'generic',
    label: 'Generic',
    description: 'Clean, minimal dark/light theme',
    className: 'theme-generic',
    dataThemeValue: 'generic',
  },
  starRealms: {
    id: 'starRealms',
    label: 'Star Realms',
    description: 'Space-themed dark theme with sci-fi aesthetic',
    className: 'theme-starRealms',
    dataThemeValue: 'starRealms',
  },
  // ADD YOUR THEME HERE:
  neon: {
    id: 'neon',
    label: 'Neon',
    description: 'Cyberpunk-inspired neon theme',
    className: 'theme-neon',
    dataThemeValue: 'neon',
  },
};
```

### Step 3: Import Theme CSS in App.tsx

Open `src/App.tsx` and add your CSS import:

```typescript
import './styles/generic.css';
import './styles/starRealms.css';
import './styles/neon.css'; // Add your import here
```

## That's It!

Your new theme will automatically:
- Appear in the Theme dropdown in Settings
- Be selectable by users
- Be persisted when games are saved
- Work seamlessly with the existing theme infrastructure

## Theme File Structure

Each theme CSS file should:

1. **Define CSS Variables** at the top for colors and common properties
2. **Use `.theme-{id}` selector** for overrides (e.g., `.theme-neon`)
3. **Override essential elements**:
   - `.btn` and `.btn:hover` (buttons are the most visible)
   - `.card` background and borders
   - `.input` styling
   - Text colors via `color: var(--theme-text)`
   - Any other elements specific to your theme

## Example Theme Structure

```css
/* Define variables for your theme */
:root {
  --my-theme-primary: #1a1a1a;
  --my-theme-accent: #ff6b35;
  --my-theme-text: #ffffff;
}

/* Apply theme-specific styles */
.theme-mytheme {
  background-color: var(--my-theme-primary);
  color: var(--my-theme-text);
}

.theme-mytheme .btn {
  background-color: var(--my-theme-accent);
}

.theme-mytheme .card {
  background-color: var(--my-theme-primary);
  border: 1px solid var(--my-theme-accent);
}
```

## Best Practices

1. **Maintain Consistency**: Ensure your theme works well across all components and pages
2. **Accessibility**: Use sufficient color contrast for text
3. **Hover States**: Include hover effects for interactive elements
4. **Test Before Publishing**: Test your theme with various game configs
5. **CSS Variables**: Use variables for easy color updates and consistency
6. **Document Colors**: Add comments explaining your color choices

## Current Themes

- **Generic**: Clean, minimal dark/light theme with blue accents
- **Star Realms**: Space-themed with purple/orange colors and sci-fi typography
