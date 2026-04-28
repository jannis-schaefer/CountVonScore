import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_PLAYER_CARD_LAYOUT_ID,
  getAvailablePlayerCardLayouts,
  getPlayerCardLayout,
  type PlayerCardLayoutDefinition,
} from '../config/playerCardLayouts';

interface PlayerCardLayoutContextType {
  layoutId: string;
  selectLayout: (nextLayoutId: string) => void;
  availableLayouts: PlayerCardLayoutDefinition[];
  autoFocusEnabled: boolean;
  setAutoFocusEnabled: (value: boolean) => void;
}

const STORAGE_KEY = 'lifecounter.playerCardLayout';
const AUTO_FOCUS_STORAGE_KEY = 'lifecounter.autoFocusEnabled';
const PlayerCardLayoutContext = createContext<PlayerCardLayoutContextType | undefined>(undefined);

export const PlayerCardLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layoutId, setLayoutId] = useState(DEFAULT_PLAYER_CARD_LAYOUT_ID);
  const [autoFocusEnabled, setAutoFocusEnabledState] = useState(true);
  const availableLayouts = useMemo(() => getAvailablePlayerCardLayouts(), []);

  useEffect(() => {
    const persisted = localStorage.getItem(STORAGE_KEY);
    if (persisted && getPlayerCardLayout(persisted)) {
      setLayoutId(persisted);
    }
    const persistedFocus = localStorage.getItem(AUTO_FOCUS_STORAGE_KEY);
    if (persistedFocus !== null) {
      setAutoFocusEnabledState(persistedFocus === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, layoutId);
    document.documentElement.setAttribute('data-player-card-layout', layoutId);
  }, [layoutId]);

  const setAutoFocusEnabled = (value: boolean) => {
    setAutoFocusEnabledState(value);
    localStorage.setItem(AUTO_FOCUS_STORAGE_KEY, String(value));
  };

  const selectLayout = (nextLayoutId: string) => {
    if (!getPlayerCardLayout(nextLayoutId)) {
      console.warn(`Player card layout "${nextLayoutId}" not found`);
      return;
    }
    setLayoutId(nextLayoutId);
  };

  return (
    <PlayerCardLayoutContext.Provider value={{ layoutId, selectLayout, availableLayouts, autoFocusEnabled, setAutoFocusEnabled }}>
      {children}
    </PlayerCardLayoutContext.Provider>
  );
};

export const usePlayerCardLayout = () => {
  const context = useContext(PlayerCardLayoutContext);
  if (!context) {
    throw new Error('usePlayerCardLayout must be used within a PlayerCardLayoutProvider');
  }
  return context;
};
