import { create } from 'zustand';
import localforage from 'localforage';

export interface CounterState {
  authority: number;
  money: number;
  attack: number;
}

export type CounterKey = keyof CounterState;

export interface CounterFlags {
  authority: boolean;
  money: boolean;
  attack: boolean;
}

export interface CounterValues {
  authority: number;
  money: number;
  attack: number;
}

export interface GameConfig {
  name?: string;
  counterNames?: Partial<Record<CounterKey, string>>;
  counterResetsOnTurn?: Partial<Record<CounterKey, boolean>>;
  counterVisibleForNonActive?: Partial<Record<CounterKey, boolean>>;
  defaultCounterValues?: Partial<Record<CounterKey, number>>;
  players?: string[];
}

export interface Player {
  id: string;
  name: string;
  counters: CounterState;
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  history: Array<{ playerIndex: number; action: string; previousState: CounterState }>;
  gameMode: 'shared' | 'multiplayer' | null;
  counterNames: {
    authority: string;
    money: string;
    attack: string;
  };
  counterResetsOnTurn: {
    authority: boolean;
    money: boolean;
    attack: boolean;
  };
  counterVisibleForNonActive: {
    authority: boolean;
    money: boolean;
    attack: boolean;
  };
  defaultCounterValues: {
    authority: number;
    money: number;
    attack: number;
  };
  currentGameConfigName: string;
  theme: 'generic' | 'starRealms';
}

interface GameStore extends GameState {
  // Player actions
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  updatePlayerName: (id: string, name: string) => void;
  
  // Counter actions
  incrementCounter: (playerId: string, counter: keyof CounterState, amount?: number) => void;
  decrementCounter: (playerId: string, counter: keyof CounterState, amount?: number) => void;
  setCounter: (playerId: string, counter: keyof CounterState, value: number) => void;
  
  // Turn navigation
  nextPlayer: () => void;
  previousPlayer: () => void;
  setCurrentPlayer: (index: number) => void;
  
  // Game controls
  resetGame: () => void;
  undo: () => void;
  
  // Game mode
  setGameMode: (mode: 'shared' | 'multiplayer') => void;
  
  // Counter names
  updateCounterNames: (names: Partial<GameStore['counterNames']>) => void;

  // Counter reset behavior
  updateCounterResetsOnTurn: (resets: Partial<GameStore['counterResetsOnTurn']>) => void;

  // Counter visibility for non-active players
  updateCounterVisibleForNonActive: (
    visibility: Partial<GameStore['counterVisibleForNonActive']>
  ) => void;

  // Counter starting values
  updateDefaultCounterValues: (values: Partial<GameStore['defaultCounterValues']>) => void;

  // Import/export style configuration
  applyGameConfig: (config: GameConfig) => void;
  
  // Theme
  setTheme: (theme: 'generic' | 'starRealms') => void;
  
  // Persistence
  loadGame: () => Promise<void>;
  saveGame: () => Promise<void>;
}

const MAX_HISTORY = 50;

const initialGameState: GameState = {
  players: [
    { id: '1', name: 'Player 1', counters: { authority: 0, money: 0, attack: 0 } },
    { id: '2', name: 'Player 2', counters: { authority: 0, money: 0, attack: 0 } },
  ],
  currentPlayerIndex: 0,
  history: [],
  gameMode: null,
  counterNames: {
    authority: 'Counter A',
    money: 'Counter B',
    attack: 'Counter C',
  },
  counterResetsOnTurn: {
    authority: false,
    money: false,
    attack: false,
  },
  counterVisibleForNonActive: {
    authority: true,
    money: false,
    attack: false,
  },
  defaultCounterValues: {
    authority: 0,
    money: 0,
    attack: 0,
  },
  currentGameConfigName: 'Generic',
  theme: 'starRealms',
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialGameState,

  addPlayer: (name: string) =>
    set((state) => ({
      players: [
        ...state.players,
        {
          id: Date.now().toString(),
          name,
          counters: { ...state.defaultCounterValues },
        },
      ],
    })),

  removePlayer: (id: string) =>
    set((state) => {
      const newPlayers = state.players.filter((p) => p.id !== id);
      let newIndex = state.currentPlayerIndex;
      if (newIndex >= newPlayers.length && newIndex > 0) {
        newIndex = newPlayers.length - 1;
      }
      return { players: newPlayers, currentPlayerIndex: newIndex };
    }),

  updatePlayerName: (id: string, name: string) =>
    set((state) => ({
      players: state.players.map((p) => (p.id === id ? { ...p, name } : p)),
    })),

  incrementCounter: (playerId: string, counter: keyof CounterState, amount = 1) => {
    set((state) => {
      const player = state.players.find((p) => p.id === playerId);
      if (!player) return state;

      const newState = { ...state };
      const playerIndex = newState.players.findIndex((p) => p.id === playerId);

      newState.players[playerIndex].counters[counter] += amount;

      // Add to history
      newState.history = [
        ...newState.history.slice(-MAX_HISTORY + 1),
        { playerIndex, action: `increment-${counter}`, previousState: { ...player.counters } },
      ];

      return newState;
    });
    get().saveGame();
  },

  decrementCounter: (playerId: string, counter: keyof CounterState, amount = 1) => {
    set((state) => {
      const player = state.players.find((p) => p.id === playerId);
      if (!player) return state;

      const newState = { ...state };
      const playerIndex = newState.players.findIndex((p) => p.id === playerId);

      newState.players[playerIndex].counters[counter] -= amount;

      // Add to history
      newState.history = [
        ...newState.history.slice(-MAX_HISTORY + 1),
        { playerIndex, action: `decrement-${counter}`, previousState: { ...player.counters } },
      ];

      return newState;
    });
    get().saveGame();
  },

  setCounter: (playerId: string, counter: keyof CounterState, value: number) => {
    set((state) => {
      const player = state.players.find((p) => p.id === playerId);
      if (!player) return state;

      const newState = { ...state };
      const playerIndex = newState.players.findIndex((p) => p.id === playerId);

      newState.players[playerIndex].counters[counter] = value;

      // Add to history
      newState.history = [
        ...newState.history.slice(-MAX_HISTORY + 1),
        { playerIndex, action: `set-${counter}`, previousState: { ...player.counters } },
      ];

      return newState;
    });
    get().saveGame();
  },

  nextPlayer: () => {
    set((state) => {
      const currentIndex = state.currentPlayerIndex;
      const nextIndex = (currentIndex + 1) % state.players.length;
      const currentPlayer = state.players[currentIndex];
      if (!currentPlayer) {
        return state;
      }

      const currentCounters = currentPlayer.counters;
      const nextCounters: CounterState = {
        authority: state.counterResetsOnTurn.authority ? 0 : currentCounters.authority,
        money: state.counterResetsOnTurn.money ? 0 : currentCounters.money,
        attack: state.counterResetsOnTurn.attack ? 0 : currentCounters.attack,
      };

      const didReset =
        nextCounters.authority !== currentCounters.authority ||
        nextCounters.money !== currentCounters.money ||
        nextCounters.attack !== currentCounters.attack;

      const updatedPlayers = [...state.players];
      updatedPlayers[currentIndex] = {
        ...currentPlayer,
        counters: nextCounters,
      };

      return {
        players: updatedPlayers,
        currentPlayerIndex: nextIndex,
        history: didReset
          ? [
              ...state.history.slice(-MAX_HISTORY + 1),
              {
                playerIndex: currentIndex,
                action: 'turn-reset',
                previousState: { ...currentCounters },
              },
            ]
          : state.history,
      };
    });
    get().saveGame();
  },

  previousPlayer: () =>
    set((state) => ({
      currentPlayerIndex:
        state.currentPlayerIndex === 0 ? state.players.length - 1 : state.currentPlayerIndex - 1,
    })),

  setCurrentPlayer: (index: number) =>
    set({ currentPlayerIndex: Math.max(0, Math.min(index, get().players.length - 1)) }),

  resetGame: () => {
    const state = get();
    const defaultCounters = { ...state.defaultCounterValues };
    set({
      ...state,
      players: state.players.map((player) => ({
        ...player,
        counters: { ...defaultCounters },
      })),
      currentPlayerIndex: 0,
      history: [],
    });
    get().saveGame();
  },

  undo: () => {
    set((state) => {
      if (state.history.length === 0) return state;

      const lastEntry = state.history[state.history.length - 1];
      const newState = { ...state };
      const playerIndex = lastEntry.playerIndex;

      newState.players[playerIndex].counters = lastEntry.previousState;
      newState.history = newState.history.slice(0, -1);

      return newState;
    });
    get().saveGame();
  },

  setGameMode: (mode: 'shared' | 'multiplayer') =>
    set({ gameMode: mode }),

  updateCounterNames: (names: Partial<GameStore['counterNames']>) =>
    set((state) => ({
      counterNames: { ...state.counterNames, ...names },
    })),

  updateCounterResetsOnTurn: (resets: Partial<GameStore['counterResetsOnTurn']>) => {
    set((state) => ({
      counterResetsOnTurn: { ...state.counterResetsOnTurn, ...resets },
    }));
    get().saveGame();
  },

  updateCounterVisibleForNonActive: (
    visibility: Partial<GameStore['counterVisibleForNonActive']>
  ) => {
    set((state) => ({
      counterVisibleForNonActive: { ...state.counterVisibleForNonActive, ...visibility },
    }));
    get().saveGame();
  },

  updateDefaultCounterValues: (values: Partial<GameStore['defaultCounterValues']>) => {
    set((state) => ({
      defaultCounterValues: { ...state.defaultCounterValues, ...values },
    }));
    get().saveGame();
  },

  applyGameConfig: (config: GameConfig) => {
    set((state) => {
      const mergedCounterNames = {
        ...state.counterNames,
        ...(config.counterNames ?? {}),
      };

      const mergedResets = {
        ...state.counterResetsOnTurn,
        ...(config.counterResetsOnTurn ?? {}),
      };

      const mergedVisibility = {
        ...state.counterVisibleForNonActive,
        ...(config.counterVisibleForNonActive ?? {}),
      };

      const mergedDefaults = {
        ...state.defaultCounterValues,
        ...(config.defaultCounterValues ?? {}),
      };

      const nextPlayers =
        config.players && config.players.length > 0
          ? config.players.map((name, index) => ({
              id: `${Date.now()}-${index}`,
              name,
              counters: { ...mergedDefaults },
            }))
          : state.players;

      return {
        ...state,
        players: nextPlayers,
        currentPlayerIndex: Math.min(state.currentPlayerIndex, Math.max(nextPlayers.length - 1, 0)),
        counterNames: mergedCounterNames,
        counterResetsOnTurn: mergedResets,
        counterVisibleForNonActive: mergedVisibility,
        defaultCounterValues: mergedDefaults,
        currentGameConfigName: config.name ?? state.currentGameConfigName,
      };
    });
    get().saveGame();
  },

  setTheme: (theme: 'generic' | 'starRealms') => {
    set({ theme });
    get().saveGame();
  },

  loadGame: async () => {
    try {
      const savedGame = await localforage.getItem<GameState>('gameState');
      if (savedGame) {
        set({
          ...initialGameState,
          ...savedGame,
          counterNames: {
            ...initialGameState.counterNames,
            ...(savedGame.counterNames ?? {}),
          },
          counterResetsOnTurn: {
            ...initialGameState.counterResetsOnTurn,
            ...(savedGame.counterResetsOnTurn ?? {}),
          },
          counterVisibleForNonActive: {
            ...initialGameState.counterVisibleForNonActive,
            ...(savedGame.counterVisibleForNonActive ?? {}),
          },
          defaultCounterValues: {
            ...initialGameState.defaultCounterValues,
            ...(savedGame.defaultCounterValues ?? {}),
          },
          currentGameConfigName:
            savedGame.currentGameConfigName ?? initialGameState.currentGameConfigName,
        });
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
        currentPlayerIndex: state.currentPlayerIndex,
        history: state.history,
        gameMode: state.gameMode,
        counterNames: state.counterNames,
        counterResetsOnTurn: state.counterResetsOnTurn,
        counterVisibleForNonActive: state.counterVisibleForNonActive,
        defaultCounterValues: state.defaultCounterValues,
        currentGameConfigName: state.currentGameConfigName,
        theme: state.theme,
      };
      await localforage.setItem('gameState', gameState);
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  },
}));
