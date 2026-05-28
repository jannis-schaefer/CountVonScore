import { createContext } from 'react';
import type { ThemeDefinition } from '../config/themes';

export interface ThemeContextType {
  theme: string;
  selectTheme: (themeId: string) => void;
  availableThemes: ThemeDefinition[];
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);