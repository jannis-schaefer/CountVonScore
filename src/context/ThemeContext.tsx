import React, { createContext, useContext, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { getTheme, getAvailableThemes, type ThemeDefinition } from '../config/themes';

interface ThemeContextType {
  theme: string;
  selectTheme: (themeId: string) => void;
  availableThemes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, setTheme } = useGameStore();
  const availableThemes = getAvailableThemes();

  useEffect(() => {
    const themeDefinition = getTheme(theme);
    if (!themeDefinition) {
      console.warn(`Theme "${theme}" not found in registry, using default`);
      return;
    }

    // Update data-theme attribute for potential attribute-based selectors
    document.documentElement.setAttribute('data-theme', themeDefinition.dataThemeValue);

    // Remove all theme classes and add the current one
    document.documentElement.classList.remove(
      ...availableThemes.map((t) => t.className)
    );
    document.documentElement.classList.add(themeDefinition.className);
  }, [theme, availableThemes]);

  const selectTheme = (themeId: string) => {
    if (getTheme(themeId)) {
      setTheme(themeId);
    } else {
      console.warn(`Theme "${themeId}" not found in registry`);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, selectTheme, availableThemes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
