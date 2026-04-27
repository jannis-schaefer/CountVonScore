/**
 * Theme Configuration Registry (AUTO-GENERATED)
 * 
 * This file is generated from CSS files in src/styles/themes/
 * Do not edit manually.
 * 
 * To add a new theme:
 * 1. Create a CSS file in src/styles/themes/ (e.g., src/styles/themes/mytheme.css)
 * 2. Add these metadata comments at the top of your CSS:
 *    - @theme-id: mytheme
 *    - @theme-label: My Theme Label
 *    - @theme-description: Brief description
 * 3. Run: npm run generate-themes
 */

export interface ThemeDefinition {
  id: string;
  label: string;
  description: string;
  className: string;
  dataThemeValue: string;
}

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
  }
};

export const THEME_IDS = Object.keys(THEMES) as Array<keyof typeof THEMES>;

export type ThemeId = 'generic' | 'starRealms';

export const DEFAULT_THEME_ID: ThemeId = 'generic';

export const getTheme = (id: string): ThemeDefinition | undefined => {
  return THEMES[id as keyof typeof THEMES];
};

export const getAvailableThemes = (): ThemeDefinition[] => {
  return THEME_IDS.map((id) => THEMES[id]);
};
