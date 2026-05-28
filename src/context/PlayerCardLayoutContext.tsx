import React, { useEffect, useMemo, useState } from 'react';
import {
  DEFAULT_PLAYER_CARD_LAYOUT_ID,
  getAvailablePlayerCardLayouts,
  getPlayerCardLayout,
} from '../config/playerCardLayouts';
import { PlayerCardLayoutContext } from './PlayerCardLayoutContextValue';

const STORAGE_KEY = 'lifecounter.playerCardLayout';
const AUTO_FOCUS_STORAGE_KEY = 'lifecounter.autoFocusEnabled';

const getInitialLayoutId = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_PLAYER_CARD_LAYOUT_ID;
  }

  const persisted = window.localStorage.getItem(STORAGE_KEY);
  return persisted && getPlayerCardLayout(persisted) ? persisted : DEFAULT_PLAYER_CARD_LAYOUT_ID;
};

const getInitialAutoFocusEnabled = () => {
  if (typeof window === 'undefined') {
    return true;
  }

  const persistedFocus = window.localStorage.getItem(AUTO_FOCUS_STORAGE_KEY);
  return persistedFocus === null ? true : persistedFocus === 'true';
};

export const PlayerCardLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [layoutId, setLayoutId] = useState(getInitialLayoutId);
  const [autoFocusEnabled, setAutoFocusEnabledState] = useState(getInitialAutoFocusEnabled);
  const availableLayouts = useMemo(() => getAvailablePlayerCardLayouts(), []);

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
