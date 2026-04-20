import React, { createContext, useContext, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

type Theme = 'generic' | 'starRealms';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, setTheme } = useGameStore();

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.remove('theme-generic', 'theme-starRealms');
    document.documentElement.classList.add(`theme-${theme}`);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'generic' ? 'starRealms' : 'generic';
    setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
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
