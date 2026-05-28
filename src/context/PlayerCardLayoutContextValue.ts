import { createContext } from 'react';
import type { PlayerCardLayoutDefinition } from '../config/playerCardLayouts';

export interface PlayerCardLayoutContextType {
  layoutId: string;
  selectLayout: (nextLayoutId: string) => void;
  availableLayouts: PlayerCardLayoutDefinition[];
  autoFocusEnabled: boolean;
  setAutoFocusEnabled: (value: boolean) => void;
}

export const PlayerCardLayoutContext = createContext<PlayerCardLayoutContextType | undefined>(undefined);