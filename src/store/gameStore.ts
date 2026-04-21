import { create } from 'zustand';
import localforage from 'localforage';

export type CounterValues = Record<string, number>;

export interface CounterDefinition {
  id: string;
  name: string;
  icon?: string;
  initialValue: number;
  persistsBetweenTurns: boolean;
  alwaysDisplayed: boolean;
}

export interface PlayerOverride {
  name?: string;
  initialCounters?: Record<string, number>;
}

export interface GameConfig {
  name?: string;
  counters?: Array<{
    id?: string;
    name: string;
    icon?: string;
    initialValue: number;
    persistsBetweenTurns: boolean;
    alwaysDisplayed: boolean;
  }>;
  players?: {
    defaultPlayerCount?: number;
    overrides?: PlayerOverride[];
  };
}

export interface Player {
  id: string;
  name: string;
  counters: CounterValues;
}

export interface GameHistoryEntry {
  playerIndex: number;
  action: string;
  previousState: CounterValues;
}

export interface GameState {
  players: Player[];
  startingPlayerIndex: number;
  turnNumber: number;
  currentPlayerIndex: number;
  history: GameHistoryEntry[];
  gameMode: 'shared' | 'multiplayer' | null;
  hasSavedGame: boolean;
  counterDefinitions: CounterDefinition[];
  defaultPlayerCount: number;
  playerOverrides: PlayerOverride[];
  currentGameConfigName: string;
  theme: 'generic' | 'starRealms';
}

interface GameStore extends GameState {
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  updatePlayerName: (id: string, name: string) => void;

  incrementCounter: (playerId: string, counterId: string, amount?: number) => void;
  decrementCounter: (playerId: string, counterId: string, amount?: number) => void;
  setCounter: (playerId: string, counterId: string, value: number) => void;

  nextTurn: () => void;
  previousTurn: () => void;
  setStartingPlayer: (index: number) => void;

  resetGame: () => void;
  undo: () => void;

  setGameMode: (mode: 'shared' | 'multiplayer') => void;
  setTheme: (theme: 'generic' | 'starRealms') => void;

  setCounterDefinitions: (definitions: CounterDefinition[]) => void;
  setDefaultPlayerCount: (count: number) => void;
  setPlayerOverrides: (overrides: PlayerOverride[]) => void;
  setCurrentGameConfigName: (name: string) => void;
  applyGameConfig: (config: GameConfig) => void;
  startNewGame: (options: { mode: 'shared' | 'multiplayer'; playerCount: number }) => void;

  loadGame: () => Promise<void>;
  saveGame: () => Promise<void>;
}

const MAX_HISTORY = 50;

const createDefaultCounterDefinitions = (): CounterDefinition[] => [
  {
    id: 'counter-1',
    name: 'Counter A',
    initialValue: 0,
    persistsBetweenTurns: true,
    alwaysDisplayed: true,
  },
  {
    id: 'counter-2',
    name: 'Counter B',
    initialValue: 0,
    persistsBetweenTurns: true,
    alwaysDisplayed: false,
  },
  {
    id: 'counter-3',
    name: 'Counter C',
    initialValue: 0,
    persistsBetweenTurns: true,
    alwaysDisplayed: false,
  },
];

const slugify = (value: string): string => {
  const slug = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || `counter-${Date.now()}`;
};

const getBaseCounterValues = (definitions: CounterDefinition[]): CounterValues => {
  return definitions.reduce<CounterValues>((acc, def) => {
    acc[def.id] = def.initialValue;
    return acc;
  }, {});
};

const applyCounterOverride = (
  base: CounterValues,
  override?: Record<string, number>
): CounterValues => {
  if (!override) {
    return { ...base };
  }

  const merged: CounterValues = { ...base };
  for (const key of Object.keys(override)) {
    if (Object.prototype.hasOwnProperty.call(merged, key)) {
      merged[key] = override[key];
    }
  }
  return merged;
};

const buildPlayers = (
  count: number,
  definitions: CounterDefinition[],
  overrides: PlayerOverride[],
  existingPlayers?: Player[]
): Player[] => {
  const safeCount = Math.max(1, count);
  const baseValues = getBaseCounterValues(definitions);

  return Array.from({ length: safeCount }, (_, index) => {
    const override = overrides[index];
    const existing = existingPlayers?.[index];

    return {
      id: existing?.id ?? `${Date.now()}-${index}`,
      name: override?.name ?? existing?.name ?? `Player ${index + 1}`,
      counters: applyCounterOverride(baseValues, override?.initialCounters),
    };
  });
};

const normalizeDefinitions = (
  counters: NonNullable<GameConfig['counters']>
): CounterDefinition[] => {
  return counters.map((counter, index) => {
    const id = counter.id?.trim() || slugify(counter.name || `counter-${index + 1}`);
    return {
      id,
      name: counter.name,
      icon: counter.icon,
      initialValue: counter.initialValue,
      persistsBetweenTurns: counter.persistsBetweenTurns,
      alwaysDisplayed: counter.alwaysDisplayed,
    };
  });
};

const initialCounterDefinitions = createDefaultCounterDefinitions();

const computeCurrentPlayerIndex = (
  startingPlayerIndex: number,
  turnNumber: number,
  playerCount: number
): number => {
  if (playerCount === 0) return 0;
  return (startingPlayerIndex + (turnNumber - 1)) % playerCount;
};

const initialGameState: GameState = {
  players: buildPlayers(2, initialCounterDefinitions, []),
  startingPlayerIndex: 0,
  turnNumber: 1,
  currentPlayerIndex: 0,
  history: [],
  gameMode: null,
  hasSavedGame: false,
  counterDefinitions: initialCounterDefinitions,
  defaultPlayerCount: 2,
  playerOverrides: [],
  currentGameConfigName: 'Generic',
  theme: 'starRealms',
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialGameState,

  addPlayer: (name: string) =>
    set((state) => {
      const newPlayer: Player = {
        id: Date.now().toString(),
        name,
        counters: getBaseCounterValues(state.counterDefinitions),
      };
      const players = [...state.players, newPlayer];
      return {
        players,
        defaultPlayerCount: players.length,
      };
    }),

  removePlayer: (id: string) =>
    set((state) => {
      const players = state.players.filter((p) => p.id !== id);
      const adjusted = players.length > 0 ? players : buildPlayers(1, state.counterDefinitions, state.playerOverrides);
      let newStarting = state.startingPlayerIndex;
      if (newStarting >= adjusted.length) {
        newStarting = adjusted.length - 1;
      }
      return {
        players: adjusted,
        startingPlayerIndex: Math.max(newStarting, 0),
        currentPlayerIndex: computeCurrentPlayerIndex(
          Math.max(newStarting, 0),
          state.turnNumber,
          adjusted.length
        ),
        defaultPlayerCount: adjusted.length,
      };
    }),

  updatePlayerName: (id: string, name: string) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === id ? { ...p, name } : p)),
    })),

  incrementCounter: (playerId: string, counterId: string, amount = 1) => {
    set((state) => {
      const playerIndex = state.players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1) return state;

      const player = state.players[playerIndex];
      const previous = { ...player.counters };
      const players = [...state.players];
      players[playerIndex] = {
        ...player,
        counters: {
          ...player.counters,
          [counterId]: (player.counters[counterId] ?? 0) + amount,
        },
      };

      return {
        players,
        history: [
          ...state.history.slice(-MAX_HISTORY + 1),
          { playerIndex, action: `increment-${counterId}`, previousState: previous },
        ],
      };
    });
    get().saveGame();
  },

  decrementCounter: (playerId: string, counterId: string, amount = 1) => {
    get().incrementCounter(playerId, counterId, -amount);
  },

  setCounter: (playerId: string, counterId: string, value: number) => {
    set((state) => {
      const playerIndex = state.players.findIndex((p) => p.id === playerId);
      if (playerIndex === -1) return state;

      const player = state.players[playerIndex];
      const previous = { ...player.counters };
      const players = [...state.players];
      players[playerIndex] = {
        ...player,
        counters: {
          ...player.counters,
          [counterId]: value,
        },
      };

      return {
        players,
        history: [
          ...state.history.slice(-MAX_HISTORY + 1),
          { playerIndex, action: `set-${counterId}`, previousState: previous },
        ],
      };
    });
    get().saveGame();
  },

  nextTurn: () => {
    set((state) => {
      const currentPlayerIndex = (state.startingPlayerIndex + state.turnNumber - 1) % state.players.length;
      const currentPlayer = state.players[currentPlayerIndex];
      if (!currentPlayer) {
        return state;
      }

      const previous = { ...currentPlayer.counters };
      const counters = { ...currentPlayer.counters };

      for (const def of state.counterDefinitions) {
        if (!def.persistsBetweenTurns) {
          counters[def.id] = def.initialValue;
        }
      }

      const didReset = state.counterDefinitions.some(
        (def) => !def.persistsBetweenTurns && previous[def.id] !== counters[def.id]
      );

      const players = [...state.players];
      players[currentPlayerIndex] = {
        ...currentPlayer,
        counters,
      };

      const nextTurnNum = state.turnNumber + 1;

      return {
        players,
        turnNumber: nextTurnNum,
        currentPlayerIndex: computeCurrentPlayerIndex(
          state.startingPlayerIndex,
          nextTurnNum,
          state.players.length
        ),
        history: didReset
          ? [
              ...state.history.slice(-MAX_HISTORY + 1),
              { playerIndex: currentPlayerIndex, action: 'turn-reset', previousState: previous },
            ]
          : state.history,
      };
    });
    get().saveGame();
  },

  previousTurn: () => {
    set((state) => {
      const newTurnNum = Math.max(1, state.turnNumber - 1);
      return {
        turnNumber: newTurnNum,
        currentPlayerIndex: computeCurrentPlayerIndex(
          state.startingPlayerIndex,
          newTurnNum,
          state.players.length
        ),
      };
    });
    get().saveGame();
  },

  setStartingPlayer: (index: number) => {
    set((state) => {
      const newStarting = Math.max(0, Math.min(index, state.players.length - 1));
      return {
        startingPlayerIndex: newStarting,
        currentPlayerIndex: computeCurrentPlayerIndex(
          newStarting,
          state.turnNumber,
          state.players.length
        ),
      };
    });
    get().saveGame();
  },

  resetGame: () => {
    set((state) => {
      const players = buildPlayers(
        state.players.length,
        state.counterDefinitions,
        state.playerOverrides,
        state.players
      );
      return {
        players,
        startingPlayerIndex: 0,
        turnNumber: 1,
        currentPlayerIndex: 0,
        history: [],
      };
    });
    get().saveGame();
  },

  undo: () => {
    set((state) => {
      if (state.history.length === 0) return state;

      const lastEntry = state.history[state.history.length - 1];
      const players = [...state.players];
      const player = players[lastEntry.playerIndex];
      if (!player) {
        return { history: state.history.slice(0, -1) };
      }

      players[lastEntry.playerIndex] = {
        ...player,
        counters: { ...lastEntry.previousState },
      };

      return {
        players,
        history: state.history.slice(0, -1),
      };
    });
    get().saveGame();
  },

  setGameMode: (mode: 'shared' | 'multiplayer') => set({ gameMode: mode }),

  setTheme: (theme: 'generic' | 'starRealms') => {
    set({ theme });
    get().saveGame();
  },

  setCounterDefinitions: (definitions: CounterDefinition[]) => {
    set((state) => {
      const players = buildPlayers(
        state.players.length,
        definitions,
        state.playerOverrides,
        state.players
      );
      return {
        counterDefinitions: definitions,
        players,
      };
    });
    get().saveGame();
  },

  setDefaultPlayerCount: (count: number) => {
    set((state) => {
      const players = buildPlayers(count, state.counterDefinitions, state.playerOverrides, state.players);
      return {
        defaultPlayerCount: Math.max(1, count),
        players,
        currentPlayerIndex: Math.min(state.currentPlayerIndex, players.length - 1),
      };
    });
    get().saveGame();
  },

  setPlayerOverrides: (overrides: PlayerOverride[]) => {
    set((state) => ({
      playerOverrides: overrides,
      players: buildPlayers(
        state.players.length,
        state.counterDefinitions,
        overrides,
        state.players
      ),
    }));
    get().saveGame();
  },

  setCurrentGameConfigName: (name: string) => {
    set({ currentGameConfigName: name.trim() || 'Unnamed Config' });
    get().saveGame();
  },

  applyGameConfig: (config: GameConfig) => {
    set((state) => {
      const nextDefinitions = config.counters
        ? normalizeDefinitions(config.counters)
        : state.counterDefinitions;

      const defaultPlayerCount = Math.max(
        1,
        config.players?.defaultPlayerCount ?? state.defaultPlayerCount
      );

      const playerOverrides = config.players?.overrides ?? state.playerOverrides;

      const players = buildPlayers(defaultPlayerCount, nextDefinitions, playerOverrides);

      return {
        ...state,
        counterDefinitions: nextDefinitions,
        defaultPlayerCount,
        playerOverrides,
        players,
        currentPlayerIndex: Math.min(state.currentPlayerIndex, players.length - 1),
        currentGameConfigName: config.name ?? state.currentGameConfigName,
        history: [],
      };
    });
    get().saveGame();
  },

  startNewGame: ({ mode, playerCount }) => {
    set((state) => {
      const players = buildPlayers(playerCount, state.counterDefinitions, state.playerOverrides);
      return {
        ...state,
        gameMode: mode,
        players,
        defaultPlayerCount: Math.max(1, playerCount),
        startingPlayerIndex: 0,
        turnNumber: 1,
        currentPlayerIndex: 0,
        history: [],
        hasSavedGame: true,
      };
    });
    get().saveGame();
  },

  loadGame: async () => {
    try {
      const savedGame = await localforage.getItem<Partial<GameState> & Record<string, unknown>>('gameState');
      if (savedGame) {
        // Migration stub:
        // If/when we publish and need to support older schemas, add versioned migration steps here.

        const mergedDefinitions =
          savedGame.counterDefinitions && savedGame.counterDefinitions.length > 0
            ? savedGame.counterDefinitions
            : initialGameState.counterDefinitions;

        const mergedState: GameState = {
          ...initialGameState,
          ...savedGame,
          hasSavedGame: true,
          counterDefinitions: mergedDefinitions,
          defaultPlayerCount:
            savedGame.defaultPlayerCount && savedGame.defaultPlayerCount > 0
              ? savedGame.defaultPlayerCount
              : initialGameState.defaultPlayerCount,
          playerOverrides:
            (savedGame.playerOverrides as PlayerOverride[] | undefined) ?? initialGameState.playerOverrides,
          currentGameConfigName:
            savedGame.currentGameConfigName ?? initialGameState.currentGameConfigName,
          players:
            savedGame.players && savedGame.players.length > 0
              ? savedGame.players
              : buildPlayers(
                  initialGameState.defaultPlayerCount,
                  mergedDefinitions,
                  initialGameState.playerOverrides
                ),
        };

        set(mergedState);
      } else {
        set({ hasSavedGame: false });
      }
    } catch (error) {
      console.error('Failed to load game:', error);
    }
  },

  saveGame: async () => {
    try {
      const state = get();
      const gameState: GameState = {
        players: state.players,
        startingPlayerIndex: state.startingPlayerIndex,
        turnNumber: state.turnNumber,
        currentPlayerIndex: state.currentPlayerIndex,
        history: state.history,
        gameMode: state.gameMode,
        hasSavedGame: true,
        counterDefinitions: state.counterDefinitions,
        defaultPlayerCount: state.defaultPlayerCount,
        playerOverrides: state.playerOverrides,
        currentGameConfigName: state.currentGameConfigName,
        theme: state.theme,
      };
      await localforage.setItem('gameState', gameState);
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  },
}));
