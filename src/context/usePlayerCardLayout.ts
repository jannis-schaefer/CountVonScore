import { useContext } from 'react';
import { PlayerCardLayoutContext } from './PlayerCardLayoutContextValue';

export const usePlayerCardLayout = () => {
  const context = useContext(PlayerCardLayoutContext);
  if (!context) {
    throw new Error('usePlayerCardLayout must be used within a PlayerCardLayoutProvider');
  }
  return context;
};