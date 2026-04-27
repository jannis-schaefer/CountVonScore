export interface PlayerCardLayoutDefinition {
  id: string;
  label: string;
  description: string;
}

export const PLAYER_CARD_LAYOUTS: Record<string, PlayerCardLayoutDefinition> = {
  grid: {
    id: 'grid',
    label: 'Grid',
    description: 'Balanced responsive grid for most screens.',
  },
  tabletop: {
    id: 'tabletop',
    label: 'Tabletop',
    description: 'Seat cards around the edges for a phone/table lying flat.',
  },
};

export const DEFAULT_PLAYER_CARD_LAYOUT_ID = 'grid';

export const getPlayerCardLayout = (id: string): PlayerCardLayoutDefinition | undefined => {
  return PLAYER_CARD_LAYOUTS[id as keyof typeof PLAYER_CARD_LAYOUTS];
};

export const getAvailablePlayerCardLayouts = (): PlayerCardLayoutDefinition[] => {
  return Object.values(PLAYER_CARD_LAYOUTS);
};
