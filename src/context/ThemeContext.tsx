import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { getTheme, getAvailableThemes } from '../config/themes';
import { ThemeContext } from './ThemeContextValue';

const availableThemes = getAvailableThemes();

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, setTheme } = useGameStore();

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
  }, [theme]);

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
