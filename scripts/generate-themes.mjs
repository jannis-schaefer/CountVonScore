#!/usr/bin/env node

/**
 * Build script to generate theme registry from CSS files
 * Scans src/styles/themes/ for .css files and extracts metadata
 * Generates src/config/themes.ts with theme definitions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const themesDir = path.join(__dirname, '../src/styles/themes');
const outputFile = path.join(__dirname, '../src/config/themes.ts');

function parseThemeMetadata(cssContent) {
  const idMatch = cssContent.match(/@theme-id:\s*(\S+)/);
  const labelMatch = cssContent.match(/@theme-label:\s*([^\n]+)/);
  const descriptionMatch = cssContent.match(/@theme-description:\s*([^\n]+)/);

  if (!idMatch || !labelMatch) {
    return null;
  }

  return {
    id: idMatch[1].trim(),
    label: labelMatch[1].trim(),
    description: descriptionMatch ? descriptionMatch[1].trim() : undefined,
  };
}

function generateThemeRegistry(themes) {
  const themeDefinitions = themes
    .map(
      (theme) => `  ${theme.id}: {
    id: '${theme.id}',
    label: '${theme.label}',
    description: '${theme.description || ''}',
    className: 'theme-${theme.id}',
    dataThemeValue: '${theme.id}',
  }`
    )
    .join(',\n');

  const themeIds = themes.map((t) => `'${t.id}'`).join(' | ');
  const firstThemeId = themes[0]?.id || 'generic';

  return `/**
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
${themeDefinitions}
};

export const THEME_IDS = Object.keys(THEMES) as Array<keyof typeof THEMES>;

export type ThemeId = ${themeIds};

export const DEFAULT_THEME_ID: ThemeId = '${firstThemeId}';

export const getTheme = (id: string): ThemeDefinition | undefined => {
  return THEMES[id as keyof typeof THEMES];
};

export const getAvailableThemes = (): ThemeDefinition[] => {
  return THEME_IDS.map((id) => THEMES[id]);
};
`;
}

function main() {
  try {
    if (!fs.existsSync(themesDir)) {
      console.error(`❌ Themes directory not found: ${themesDir}`);
      process.exit(1);
    }

    const cssFiles = fs
      .readdirSync(themesDir)
      .filter((file) => file.endsWith('.css'));

    if (cssFiles.length === 0) {
      console.warn(`⚠️  No CSS files found in ${themesDir}`);
      process.exit(1);
    }

    const themes = [];

    cssFiles.forEach((file) => {
      const filePath = path.join(themesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const metadata = parseThemeMetadata(content);

      if (metadata) {
        themes.push(metadata);
        console.log(`✓ Found theme: ${metadata.id} (${file})`);
      } else {
        // Fallback to filename if metadata is missing
        const id = file.replace('.css', '');
        const label = id.charAt(0).toUpperCase() + id.slice(1);
        themes.push({ id, label });
        console.log(
          `⚠️  No metadata in ${file}, using filename as fallback: ${id}`
        );
      }
    });

    const registryContent = generateThemeRegistry(themes);
    fs.writeFileSync(outputFile, registryContent);

    console.log(
      `\n✅ Generated theme registry: ${outputFile}`
    );
    console.log(`   Found ${themes.length} theme(s)`);
  } catch (error) {
    console.error('❌ Error generating themes:', error);
    process.exit(1);
  }
}

main();
