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

export interface TurnDeltaEntry {
  playerId: string;
  counters: CounterValues;
}

export interface TurnRecord {
  startPlayers: Player[];
  endPlayers: Player[];
  latestKeyTurnNumber: number;
}

export interface TurnActionEntry {
  playerId: string;
  counterId: string;
  previousValue: number;
  nextValue: number;
}

export interface GameHistoryEntry {
  playerIndex: number;
  action: string;
  previousState: CounterValues;
  scope: 'current' | 'historical';
  turnNumber: number;
}

export interface GameState {
  players: Player[];
  turnStartPlayers: Player[];
  currentTurnActions: TurnActionEntry[];
  turnRecords: TurnRecord[];
  viewedTurnNumber: number | null;
  viewedPlayers: Player[] | null;
  isHistoricalTurnDirty: boolean;
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
  applyHistoricalChanges: () => void;
  continueFromHistoricalTurn: () => void;

  resetGame: () => void;
  undo: () => void;

  setGameMode: (mode: 'shared' | 'multiplayer') => void;
  setTheme: (theme: 'generic' | 'starRealms') => void;

  setCounterDefinitions: (
    definitions: CounterDefinition[],
    options?: { recalculateFromInitialValues?: boolean }
  ) => void;
  setDefaultPlayerCount: (count: number) => void;
  setPlayerOverrides: (overrides: PlayerOverride[]) => void;
  setCurrentGameConfigName: (name: string) => void;
  applyGameConfig: (config: GameConfig) => void;
  startNewGame: (options: { mode: 'shared' | 'multiplayer'; playerCount: number }) => void;

  loadGame: () => Promise<void>;
  saveGame: () => Promise<void>;
}

const MAX_HISTORY = 50;
const KEY_TURN_INTERVAL = 8;

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

const clonePlayers = (players: Player[]): Player[] => {
  return players.map((player) => ({
    ...player,
    counters: { ...player.counters },
  }));
};

const cloneTurnRecords = (records: TurnRecord[]): TurnRecord[] => {
  return records.map((record) => ({
    ...record,
    startPlayers: clonePlayers(record.startPlayers),
    endPlayers: clonePlayers(record.endPlayers),
  }));
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

const getLatestKeyTurnNumber = (turnNumber: number): number => {
  return turnNumber - ((turnNumber - 1) % KEY_TURN_INTERVAL);
};

const buildTurnDelta = (startPlayers: Player[], endPlayers: Player[]): TurnDeltaEntry[] => {
  return endPlayers.map((endPlayer) => {
    const startPlayer = startPlayers.find((player) => player.id === endPlayer.id);
    const counterKeys = new Set<string>([
      ...Object.keys(startPlayer?.counters ?? {}),
      ...Object.keys(endPlayer.counters),
    ]);

    const counters = Array.from(counterKeys).reduce<CounterValues>((acc, counterId) => {
      const startValue = startPlayer?.counters[counterId] ?? 0;
      const endValue = endPlayer.counters[counterId] ?? 0;
      acc[counterId] = endValue - startValue;
      return acc;
    }, {});

    return {
      playerId: endPlayer.id,
      counters,
    };
  });
};

const applyTurnDelta = (startPlayers: Player[], delta: TurnDeltaEntry[]): Player[] => {
  return startPlayers.map((player) => {
    const playerDelta = delta.find((entry) => entry.playerId === player.id);
    if (!playerDelta) {
      return {
        ...player,
        counters: { ...player.counters },
      };
    }

    const counters = Object.entries(playerDelta.counters).reduce<CounterValues>(
      (acc, [counterId, amount]) => {
        acc[counterId] = (acc[counterId] ?? 0) + amount;
        return acc;
      },
      { ...player.counters }
    );

    return {
      ...player,
      counters,
    };
  });
};

const transitionToNextTurnStart = (
  endPlayers: Player[],
  playerIndex: number,
  definitions: CounterDefinition[]
): Player[] => {
  const nextPlayers = clonePlayers(endPlayers);
  const endingPlayer = nextPlayers[playerIndex];

  if (!endingPlayer) {
    return nextPlayers;
  }

  for (const definition of definitions) {
    if (!definition.persistsBetweenTurns) {
      endingPlayer.counters[definition.id] = definition.initialValue;
    }
  }

  return nextPlayers;
};

const playersEqual = (left: Player[], right: Player[]): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((leftPlayer, index) => {
    const rightPlayer = right[index];
    if (!rightPlayer || leftPlayer.id !== rightPlayer.id || leftPlayer.name !== rightPlayer.name) {
      return false;
    }

    const leftKeys = Object.keys(leftPlayer.counters);
    const rightKeys = Object.keys(rightPlayer.counters);
    if (leftKeys.length !== rightKeys.length) {
      return false;
    }

    return leftKeys.every((counterId) => leftPlayer.counters[counterId] === rightPlayer.counters[counterId]);
  });
};

const appendHistoryEntry = (
  history: GameHistoryEntry[],
  entry: GameHistoryEntry
): GameHistoryEntry[] => {
  return [...history.slice(-MAX_HISTORY + 1), entry];
};

const getDisplayedPlayers = (state: GameState): Player[] => {
  return state.viewedPlayers ?? state.players;
};

const getTurnRecord = (turnRecords: TurnRecord[], turnNumber: number): TurnRecord | undefined => {
  if (turnNumber < 1) {
    return undefined;
  }
  return turnRecords[turnNumber - 1];
};

const clearHistoricalViewState = () => ({
  viewedTurnNumber: null,
  viewedPlayers: null,
  isHistoricalTurnDirty: false,
  history: [],
});

const syncPlayerNames = (players: Player[], id: string, name: string): Player[] => {
  return players.map((player) => (player.id === id ? { ...player, name } : player));
};

const syncTurnRecordNames = (turnRecords: TurnRecord[], id: string, name: string): TurnRecord[] => {
  return turnRecords.map((record) => ({
    ...record,
    startPlayers: syncPlayerNames(record.startPlayers, id, name),
    endPlayers: syncPlayerNames(record.endPlayers, id, name),
  }));
};

const normalizeTurnRecords = (records: unknown): TurnRecord[] => {
  if (!Array.isArray(records)) {
    return [];
  }

  return records.flatMap((record, index) => {
    if (!record || typeof record !== 'object') {
      return [];
    }

    const candidate = record as Partial<TurnRecord>;
    if (
      !Array.isArray(candidate.startPlayers) ||
      !Array.isArray(candidate.endPlayers)
    ) {
      return [];
    }

    const normalizedStart = clonePlayers(candidate.startPlayers as Player[]);
    const normalizedEnd = clonePlayers(candidate.endPlayers as Player[]);

    return [{
      startPlayers: normalizedStart,
      endPlayers: normalizedEnd,
      latestKeyTurnNumber:
        typeof candidate.latestKeyTurnNumber === 'number' && candidate.latestKeyTurnNumber > 0
          ? candidate.latestKeyTurnNumber
          : getLatestKeyTurnNumber(index + 1),
    }];
  });
};

const buildReopenUndoEntries = (
  startPlayers: Player[],
  endPlayers: Player[],
  turnNumber: number
): GameHistoryEntry[] => {
  const entries: GameHistoryEntry[] = [];

  for (let playerIndex = 0; playerIndex < endPlayers.length; playerIndex += 1) {
    const endPlayer = endPlayers[playerIndex];
    const startPlayer = startPlayers.find((player) => player.id === endPlayer.id);
    if (!startPlayer) {
      continue;
    }

    const counterIds = new Set([...Object.keys(endPlayer.counters), ...Object.keys(startPlayer.counters)]);
    const hasDifference = Array.from(counterIds).some(
      (counterId) => (endPlayer.counters[counterId] ?? 0) !== (startPlayer.counters[counterId] ?? 0)
    );

    if (hasDifference) {
      entries.push({
        playerIndex,
        action: 'reopen-turn',
        previousState: { ...startPlayer.counters },
        scope: 'historical',
        turnNumber,
      });
    }
  }

  return entries;
};

const remapPlayerCountersToDefinitions = (
  counters: CounterValues,
  definitions: CounterDefinition[]
): CounterValues => {
  return definitions.reduce<CounterValues>((acc, definition) => {
    if (Object.prototype.hasOwnProperty.call(counters, definition.id)) {
      acc[definition.id] = counters[definition.id];
    } else {
      acc[definition.id] = definition.initialValue;
    }
    return acc;
  }, {});
};

const remapPlayersToDefinitions = (players: Player[], definitions: CounterDefinition[]): Player[] => {
  return players.map((player) => ({
    ...player,
    counters: remapPlayerCountersToDefinitions(player.counters, definitions),
  }));
};

const remapTurnRecordsToDefinitions = (
  turnRecords: TurnRecord[],
  definitions: CounterDefinition[]
): TurnRecord[] => {
  return turnRecords.map((record) => {
    const startPlayers = remapPlayersToDefinitions(record.startPlayers, definitions);
    const endPlayers = remapPlayersToDefinitions(record.endPlayers, definitions);
    return {
      ...record,
      startPlayers,
      endPlayers,
      delta: buildTurnDelta(startPlayers, endPlayers),
    };
  });
};

const getInitialValueDeltas = (
  previousDefinitions: CounterDefinition[],
  nextDefinitions: CounterDefinition[]
): CounterValues => {
  const previousById = previousDefinitions.reduce<Record<string, CounterDefinition>>((acc, definition) => {
    acc[definition.id] = definition;
    return acc;
  }, {});

  return nextDefinitions.reduce<CounterValues>((acc, definition) => {
    const previous = previousById[definition.id];
    if (!previous) {
      return acc;
    }

    const delta = definition.initialValue - previous.initialValue;
    if (delta !== 0) {
      acc[definition.id] = delta;
    }

    return acc;
  }, {});
};

const applyInitialValueDeltasToPlayers = (
  players: Player[],
  deltas: CounterValues
): Player[] => {
  if (Object.keys(deltas).length === 0) {
    return players;
  }

  return players.map((player) => ({
    ...player,
    counters: Object.entries(deltas).reduce<CounterValues>((acc, [counterId, delta]) => {
      if (!Object.prototype.hasOwnProperty.call(acc, counterId)) {
        return acc;
      }

      acc[counterId] += delta;
      return acc;
    }, { ...player.counters }),
  }));
};

const applyInitialValueDeltasToTurnRecords = (
  turnRecords: TurnRecord[],
  deltas: CounterValues
): TurnRecord[] => {
  if (Object.keys(deltas).length === 0) {
    return turnRecords;
  }

  return turnRecords.map((record) => {
    const startPlayers = applyInitialValueDeltasToPlayers(record.startPlayers, deltas);
    const endPlayers = applyInitialValueDeltasToPlayers(record.endPlayers, deltas);
    return {
      ...record,
      startPlayers,
      endPlayers,
      delta: buildTurnDelta(startPlayers, endPlayers),
    };
  });
};

const createInitialPlayers = () => buildPlayers(2, initialCounterDefinitions, []);
const initialPlayers = createInitialPlayers();

const initialGameState: GameState = {
  players: initialPlayers,
  turnStartPlayers: clonePlayers(initialPlayers),
  currentTurnActions: [],
  turnRecords: [],
  viewedTurnNumber: null,
  viewedPlayers: null,
  isHistoricalTurnDirty: false,
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
        turnStartPlayers: clonePlayers(players),
        currentTurnActions: [],
        turnRecords: [],
        defaultPlayerCount: players.length,
        ...clearHistoricalViewState(),
      };
    }),

  removePlayer: (id: string) =>
    set((state) => {
      const players = state.players.filter((player) => player.id !== id);
      const adjusted =
        players.length > 0 ? players : buildPlayers(1, state.counterDefinitions, state.playerOverrides);
      const newStarting = Math.max(0, Math.min(state.startingPlayerIndex, adjusted.length - 1));
      return {
        players: adjusted,
        turnStartPlayers: clonePlayers(adjusted),
        currentTurnActions: [],
        turnRecords: [],
        startingPlayerIndex: newStarting,
        currentPlayerIndex: computeCurrentPlayerIndex(newStarting, state.turnNumber, adjusted.length),
        defaultPlayerCount: adjusted.length,
        ...clearHistoricalViewState(),
      };
    }),

  updatePlayerName: (id: string, name: string) =>
    set((state) => ({
      players: syncPlayerNames(state.players, id, name),
      turnStartPlayers: syncPlayerNames(state.turnStartPlayers, id, name),
      viewedPlayers: state.viewedPlayers ? syncPlayerNames(state.viewedPlayers, id, name) : null,
      turnRecords: syncTurnRecordNames(state.turnRecords, id, name),
    })),

  incrementCounter: (playerId: string, counterId: string, amount = 1) => {
    set((state) => {
      const targetPlayers = getDisplayedPlayers(state);
      const playerIndex = targetPlayers.findIndex((player) => player.id === playerId);
      if (playerIndex === -1) {
        return state;
      }

      const players = clonePlayers(targetPlayers);
      const player = players[playerIndex];
      const previous = { ...player.counters };
      player.counters[counterId] = (player.counters[counterId] ?? 0) + amount;

      const entry: GameHistoryEntry = {
        playerIndex,
        action: `increment-${counterId}`,
        previousState: previous,
        scope: state.viewedTurnNumber === null ? 'current' : 'historical',
        turnNumber: state.viewedTurnNumber ?? state.turnNumber,
      };

      if (state.viewedTurnNumber !== null) {
        return {
          viewedPlayers: players,
          isHistoricalTurnDirty: true,
          history: appendHistoryEntry(state.history, entry),
        };
      }

      return {
        players,
        currentTurnActions: [
          ...state.currentTurnActions,
          {
            playerId,
            counterId,
            previousValue: previous[counterId] ?? 0,
            nextValue: player.counters[counterId],
          },
        ],
        history: appendHistoryEntry(state.history, entry),
      };
    });

    if (get().viewedTurnNumber === null) {
      get().saveGame();
    }
  },

  decrementCounter: (playerId: string, counterId: string, amount = 1) => {
    get().incrementCounter(playerId, counterId, -amount);
  },

  setCounter: (playerId: string, counterId: string, value: number) => {
    set((state) => {
      const targetPlayers = getDisplayedPlayers(state);
      const playerIndex = targetPlayers.findIndex((player) => player.id === playerId);
      if (playerIndex === -1) {
        return state;
      }

      const players = clonePlayers(targetPlayers);
      const player = players[playerIndex];
      const previous = { ...player.counters };
      player.counters[counterId] = value;

      const entry: GameHistoryEntry = {
        playerIndex,
        action: `set-${counterId}`,
        previousState: previous,
        scope: state.viewedTurnNumber === null ? 'current' : 'historical',
        turnNumber: state.viewedTurnNumber ?? state.turnNumber,
      };

      if (state.viewedTurnNumber !== null) {
        return {
          viewedPlayers: players,
          isHistoricalTurnDirty: true,
          history: appendHistoryEntry(state.history, entry),
        };
      }

      return {
        players,
        currentTurnActions: [
          ...state.currentTurnActions,
          {
            playerId,
            counterId,
            previousValue: previous[counterId] ?? 0,
            nextValue: value,
          },
        ],
        history: appendHistoryEntry(state.history, entry),
      };
    });

    if (get().viewedTurnNumber === null) {
      get().saveGame();
    }
  },

  nextTurn: () => {
    set((state) => {
      if (state.viewedTurnNumber !== null) {
        if (state.isHistoricalTurnDirty) {
          return state;
        }

        const nextViewedTurnNumber = state.viewedTurnNumber + 1;
        if (nextViewedTurnNumber < state.turnNumber) {
          const nextRecord = getTurnRecord(state.turnRecords, nextViewedTurnNumber);
          if (!nextRecord) {
            return state;
          }

          return {
            viewedTurnNumber: nextViewedTurnNumber,
            viewedPlayers: clonePlayers(nextRecord.endPlayers),
            history: [],
          };
        }

        return clearHistoricalViewState();
      }

      const currentPlayer = state.players[state.currentPlayerIndex];
      if (!currentPlayer) {
        return state;
      }

      const finalizedPlayers = clonePlayers(state.players);
      const newTurnRecord: TurnRecord = {
        startPlayers: clonePlayers(state.turnStartPlayers),
        endPlayers: finalizedPlayers,
        latestKeyTurnNumber: getLatestKeyTurnNumber(state.turnNumber),
      };

      const nextPlayers = transitionToNextTurnStart(
        finalizedPlayers,
        state.currentPlayerIndex,
        state.counterDefinitions
      );
      const nextTurnNumber = state.turnNumber + 1;

      return {
        players: nextPlayers,
        turnStartPlayers: clonePlayers(nextPlayers),
        currentTurnActions: [],
        turnRecords: [...state.turnRecords, newTurnRecord],
        turnNumber: nextTurnNumber,
        currentPlayerIndex: computeCurrentPlayerIndex(
          state.startingPlayerIndex,
          nextTurnNumber,
          nextPlayers.length
        ),
        history: [],
      };
    });
    get().saveGame();
  },

  previousTurn: () => {
    set((state) => {
      if (state.viewedTurnNumber !== null) {
        if (state.isHistoricalTurnDirty || state.viewedTurnNumber <= 1) {
          return state;
        }

        const previousRecord = getTurnRecord(state.turnRecords, state.viewedTurnNumber - 1);
        if (!previousRecord) {
          return state;
        }

        return {
          viewedTurnNumber: state.viewedTurnNumber - 1,
          viewedPlayers: clonePlayers(previousRecord.endPlayers),
          history: [],
        };
      }

      const latestFinishedTurnNumber = state.turnNumber - 1;
      if (latestFinishedTurnNumber < 1) {
        return state;
      }

      const previousRecord = getTurnRecord(state.turnRecords, latestFinishedTurnNumber);
      if (!previousRecord) {
        return state;
      }

      return {
        viewedTurnNumber: latestFinishedTurnNumber,
        viewedPlayers: clonePlayers(previousRecord.endPlayers),
        history: [],
      };
    });
  },

  setStartingPlayer: (index: number) => {
    set((state) => {
      const newStarting = Math.max(0, Math.min(index, state.players.length - 1));
      return {
        startingPlayerIndex: newStarting,
        currentPlayerIndex: computeCurrentPlayerIndex(newStarting, state.turnNumber, state.players.length),
      };
    });
    get().saveGame();
  },

  applyHistoricalChanges: () => {
    set((state) => {
      if (state.viewedTurnNumber === null || !state.viewedPlayers) {
        return state;
      }

      const editedTurnNumber = state.viewedTurnNumber;
      const editedIndexFromTurn = editedTurnNumber - 1;
      if (editedIndexFromTurn < 0 || editedIndexFromTurn >= state.turnRecords.length) {
        return state;
      }

      const updatedRecords = cloneTurnRecords(state.turnRecords);
      updatedRecords[editedIndexFromTurn] = {
        ...updatedRecords[editedIndexFromTurn],
        endPlayers: clonePlayers(state.viewedPlayers),
        latestKeyTurnNumber: getLatestKeyTurnNumber(editedTurnNumber),
      };

      for (let index = editedIndexFromTurn + 1; index < updatedRecords.length; index += 1) {
        const previousRecord = updatedRecords[index - 1];
        const originalRecord = updatedRecords[index];
        const previousTurnNumber = index;
        const previousTurnPlayerIndex = computeCurrentPlayerIndex(
          state.startingPlayerIndex,
          previousTurnNumber,
          previousRecord.endPlayers.length
        );
        const nextStartPlayers = transitionToNextTurnStart(
          previousRecord.endPlayers,
          previousTurnPlayerIndex,
          state.counterDefinitions
        );

        const originalDelta = buildTurnDelta(originalRecord.startPlayers, originalRecord.endPlayers);

        updatedRecords[index] = {
          ...originalRecord,
          startPlayers: nextStartPlayers,
          endPlayers: applyTurnDelta(nextStartPlayers, originalDelta),
          latestKeyTurnNumber: getLatestKeyTurnNumber(index + 1),
        };
      }

      const recalculatedCurrentTurnStart = updatedRecords.length > 0
        ? transitionToNextTurnStart(
            updatedRecords[updatedRecords.length - 1].endPlayers,
            computeCurrentPlayerIndex(
              state.startingPlayerIndex,
              updatedRecords.length,
              updatedRecords[updatedRecords.length - 1].endPlayers.length
            ),
            state.counterDefinitions
          )
        : clonePlayers(state.turnStartPlayers);

      const currentTurnDelta = buildTurnDelta(state.turnStartPlayers, state.players);
      const recalculatedPlayers = applyTurnDelta(recalculatedCurrentTurnStart, currentTurnDelta);

      return {
        players: recalculatedPlayers,
        turnStartPlayers: clonePlayers(recalculatedCurrentTurnStart),
        turnRecords: updatedRecords,
        ...clearHistoricalViewState(),
      };
    });
    get().saveGame();
  },

  continueFromHistoricalTurn: () => {
    set((state) => {
      if (state.viewedTurnNumber === null || !state.viewedPlayers) {
        return state;
      }

      const editedTurnNumber = state.viewedTurnNumber;
      const editedIndex = editedTurnNumber - 1;
      if (editedIndex < 0 || editedIndex >= state.turnRecords.length) {
        return state;
      }

      const updatedRecords = cloneTurnRecords(state.turnRecords.slice(0, editedIndex + 1));
      const editedRecord = updatedRecords[editedIndex];
      updatedRecords[editedIndex] = {
        ...editedRecord,
        endPlayers: clonePlayers(state.viewedPlayers),
        latestKeyTurnNumber: getLatestKeyTurnNumber(editedTurnNumber),
      };

      const editedPlayerIndex = computeCurrentPlayerIndex(
        state.startingPlayerIndex,
        editedTurnNumber,
        updatedRecords[editedIndex].endPlayers.length
      );

      const nextPlayers = transitionToNextTurnStart(
        updatedRecords[editedIndex].endPlayers,
        editedPlayerIndex,
        state.counterDefinitions
      );
      const nextTurnNumber = state.viewedTurnNumber + 1;

      return {
        players: nextPlayers,
        turnStartPlayers: clonePlayers(nextPlayers),
        currentTurnActions: [],
        turnRecords: updatedRecords,
        turnNumber: nextTurnNumber,
        currentPlayerIndex: computeCurrentPlayerIndex(
          state.startingPlayerIndex,
          nextTurnNumber,
          nextPlayers.length
        ),
        ...clearHistoricalViewState(),
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
        turnStartPlayers: clonePlayers(players),
        currentTurnActions: [],
        turnRecords: [],
        startingPlayerIndex: 0,
        turnNumber: 1,
        currentPlayerIndex: 0,
        ...clearHistoricalViewState(),
      };
    });
    get().saveGame();
  },

  undo: () => {
    set((state) => {
      if (state.history.length === 0) {
        if (state.viewedTurnNumber === null && state.turnNumber > 1) {
          const reopenTurnNumber = state.turnNumber - 1;
          const reopenRecord = getTurnRecord(state.turnRecords, reopenTurnNumber);
          if (!reopenRecord) {
            return state;
          }

          return {
            viewedTurnNumber: reopenTurnNumber,
            viewedPlayers: clonePlayers(reopenRecord.endPlayers),
            isHistoricalTurnDirty: false,
            currentTurnActions: [],
            history: buildReopenUndoEntries(reopenRecord.startPlayers, reopenRecord.endPlayers, reopenTurnNumber),
          };
        }

        return state;
      }

      const lastEntry = state.history[state.history.length - 1];
      if (lastEntry.scope === 'historical') {
        if (state.viewedTurnNumber !== lastEntry.turnNumber || !state.viewedPlayers) {
          return {
            history: state.history.slice(0, -1),
          };
        }

        const viewedPlayers = clonePlayers(state.viewedPlayers);
        const player = viewedPlayers[lastEntry.playerIndex];
        if (!player) {
          return {
            history: state.history.slice(0, -1),
          };
        }

        player.counters = { ...lastEntry.previousState };
        const originalRecord = getTurnRecord(state.turnRecords, lastEntry.turnNumber);

        return {
          viewedPlayers,
          isHistoricalTurnDirty: originalRecord ? !playersEqual(viewedPlayers, originalRecord.endPlayers) : false,
          history: state.history.slice(0, -1),
        };
      }

      if (state.viewedTurnNumber !== null) {
        return {
          history: state.history.slice(0, -1),
        };
      }

      const players = clonePlayers(state.players);
      const player = players[lastEntry.playerIndex];
      if (!player) {
        return {
          history: state.history.slice(0, -1),
        };
      }

      player.counters = { ...lastEntry.previousState };
      return {
        players,
        currentTurnActions: state.currentTurnActions.slice(0, -1),
        history: state.history.slice(0, -1),
      };
    });

    if (get().viewedTurnNumber === null) {
      get().saveGame();
    }
  },

  setGameMode: (mode: 'shared' | 'multiplayer') => set({ gameMode: mode }),

  setTheme: (theme: 'generic' | 'starRealms') => {
    set({ theme });
    get().saveGame();
  },

  setCounterDefinitions: (definitions: CounterDefinition[], options) => {
    set((state) => {
      const recalculateFromInitialValues = Boolean(options?.recalculateFromInitialValues);
      const initialValueDeltas = recalculateFromInitialValues
        ? getInitialValueDeltas(state.counterDefinitions, definitions)
        : {};

      const remappedPlayers = remapPlayersToDefinitions(state.players, definitions);
      const remappedTurnStartPlayers = remapPlayersToDefinitions(state.turnStartPlayers, definitions);
      const remappedTurnRecords = remapTurnRecordsToDefinitions(state.turnRecords, definitions);
      const remappedViewedPlayers = state.viewedPlayers
        ? remapPlayersToDefinitions(state.viewedPlayers, definitions)
        : null;

      const players = applyInitialValueDeltasToPlayers(remappedPlayers, initialValueDeltas);
      const turnStartPlayers = applyInitialValueDeltasToPlayers(remappedTurnStartPlayers, initialValueDeltas);
      const turnRecords = applyInitialValueDeltasToTurnRecords(remappedTurnRecords, initialValueDeltas);
      const viewedPlayers = remappedViewedPlayers
        ? applyInitialValueDeltasToPlayers(remappedViewedPlayers, initialValueDeltas)
        : null;
      const viewedRecord = state.viewedTurnNumber !== null
        ? getTurnRecord(turnRecords, state.viewedTurnNumber)
        : undefined;

      return {
        counterDefinitions: definitions,
        players,
        turnStartPlayers,
        turnRecords,
        viewedPlayers,
        isHistoricalTurnDirty:
          state.viewedTurnNumber !== null && viewedPlayers && viewedRecord
            ? !playersEqual(viewedPlayers, viewedRecord.endPlayers)
            : false,
        history: [],
        currentTurnActions: [],
      };
    });
    get().saveGame();
  },

  setDefaultPlayerCount: (count: number) => {
    set({ defaultPlayerCount: Math.max(1, count) });
    get().saveGame();
  },

  setPlayerOverrides: (overrides: PlayerOverride[]) => {
    set({ playerOverrides: overrides });
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
      const players = remapPlayersToDefinitions(state.players, nextDefinitions);
      const turnStartPlayers = remapPlayersToDefinitions(state.turnStartPlayers, nextDefinitions);
      const turnRecords = remapTurnRecordsToDefinitions(state.turnRecords, nextDefinitions);
      const viewedPlayers = state.viewedPlayers
        ? remapPlayersToDefinitions(state.viewedPlayers, nextDefinitions)
        : null;
      const viewedRecord = state.viewedTurnNumber !== null
        ? getTurnRecord(turnRecords, state.viewedTurnNumber)
        : undefined;

      return {
        ...state,
        counterDefinitions: nextDefinitions,
        defaultPlayerCount,
        playerOverrides,
        players,
        turnStartPlayers,
        turnRecords,
        viewedPlayers,
        currentPlayerIndex: Math.min(state.currentPlayerIndex, players.length - 1),
        currentGameConfigName: config.name ?? state.currentGameConfigName,
        isHistoricalTurnDirty:
          state.viewedTurnNumber !== null && viewedPlayers && viewedRecord
            ? !playersEqual(viewedPlayers, viewedRecord.endPlayers)
            : false,
        history: [],
        currentTurnActions: [],
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
        turnStartPlayers: clonePlayers(players),
        currentTurnActions: [],
        turnRecords: [],
        defaultPlayerCount: Math.max(1, playerCount),
        startingPlayerIndex: 0,
        turnNumber: 1,
        currentPlayerIndex: 0,
        hasSavedGame: true,
        ...clearHistoricalViewState(),
      };
    });
    get().saveGame();
  },

  loadGame: async () => {
    try {
      const savedGame = await localforage.getItem<Partial<GameState> & Record<string, unknown>>('gameState');
      if (savedGame) {
        const mergedDefinitions =
          savedGame.counterDefinitions && savedGame.counterDefinitions.length > 0
            ? savedGame.counterDefinitions
            : initialGameState.counterDefinitions;

        const players =
          savedGame.players && savedGame.players.length > 0
            ? clonePlayers(savedGame.players)
            : buildPlayers(
                initialGameState.defaultPlayerCount,
                mergedDefinitions,
                initialGameState.playerOverrides
              );

        const startingPlayerIndex =
          typeof savedGame.startingPlayerIndex === 'number'
            ? Math.max(0, Math.min(savedGame.startingPlayerIndex, players.length - 1))
            : initialGameState.startingPlayerIndex;

        const turnNumber =
          typeof savedGame.turnNumber === 'number' && savedGame.turnNumber > 0
            ? savedGame.turnNumber
            : initialGameState.turnNumber;

        const turnRecords = normalizeTurnRecords(savedGame.turnRecords);
        const turnStartPlayers =
          Array.isArray(savedGame.turnStartPlayers) && savedGame.turnStartPlayers.length > 0
            ? clonePlayers(savedGame.turnStartPlayers as Player[])
            : clonePlayers(players);

        const mergedState: GameState = {
          ...initialGameState,
          ...savedGame,
          players,
          turnStartPlayers,
          currentTurnActions: [],
          turnRecords,
          viewedTurnNumber: null,
          viewedPlayers: null,
          isHistoricalTurnDirty: false,
          startingPlayerIndex,
          turnNumber,
          currentPlayerIndex: computeCurrentPlayerIndex(startingPlayerIndex, turnNumber, players.length),
          history: [],
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
          theme: savedGame.theme === 'generic' ? 'generic' : 'starRealms',
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
      const gameState: Partial<GameState> = {
        players: state.players,
        turnStartPlayers: state.turnStartPlayers,
        turnRecords: state.turnRecords,
        startingPlayerIndex: state.startingPlayerIndex,
        turnNumber: state.turnNumber,
        currentPlayerIndex: state.currentPlayerIndex,
        history: [],
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