import localforage from 'localforage';
import type { EliminationOutcome, EliminationRule } from '../engine/elimination';

const GAME_STATE_KEY = 'gameState';

type ThemeName = 'generic' | 'starRealms';
type GameMode = 'shared' | 'multiplayer' | null;

export interface PersistedCounterDefinition {
  id: string;
  name: string;
  icon?: string;
  initialValue: number;
  persistsBetweenTurns: boolean;
  alwaysDisplayed: boolean;
}

export interface PersistedPlayer {
  id: string;
  name: string;
  counters: Record<string, number>;
}

export interface PersistedTurnRecord {
  actingPlayerId: string;
  startPlayers: PersistedPlayer[];
  endPlayers: PersistedPlayer[];
  latestKeyTurnNumber: number;
}

export interface PersistedPlayerOverride {
  name?: string;
  initialCounters?: Record<string, number>;
}

export interface PersistedGameState {
  players: PersistedPlayer[];
  turnStartPlayers: PersistedPlayer[];
  turnRecords: PersistedTurnRecord[];
  startingPlayerIndex: number;
  turnNumber: number;
  currentPlayerIndex: number;
  gameMode: GameMode;
  counterDefinitions: PersistedCounterDefinition[];
  defaultPlayerCount: number;
  playerOverrides: PersistedPlayerOverride[];
  eliminationEnabled: boolean;
  eliminationCounterId: string;
  eliminationThreshold: number;
  eliminationOutcome: EliminationOutcome;
  eliminationRule: EliminationRule;
  currentGameConfigName: string;
  theme: ThemeName;
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const isString = (value: unknown): value is string => typeof value === 'string';
const isBoolean = (value: unknown): value is boolean => typeof value === 'boolean';
const isNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

const isPlayer = (value: unknown): value is PersistedPlayer => {
  return (
    isObject(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isObject(value.counters)
  );
};

const isCounterDefinition = (value: unknown): value is PersistedCounterDefinition => {
  return (
    isObject(value) &&
    isString(value.id) &&
    isString(value.name) &&
    isNumber(value.initialValue) &&
    isBoolean(value.persistsBetweenTurns) &&
    isBoolean(value.alwaysDisplayed)
  );
};

const isTurnRecord = (value: unknown): value is PersistedTurnRecord => {
  return (
    isObject(value) &&
    isString(value.actingPlayerId) &&
    Array.isArray(value.startPlayers) &&
    value.startPlayers.every(isPlayer) &&
    Array.isArray(value.endPlayers) &&
    value.endPlayers.every(isPlayer) &&
    isNumber(value.latestKeyTurnNumber)
  );
};

const isPlayerOverride = (value: unknown): value is PersistedPlayerOverride => {
  if (!isObject(value)) {
    return false;
  }

  const hasValidName = value.name === undefined || isString(value.name);
  const hasValidInitialCounters =
    value.initialCounters === undefined || isObject(value.initialCounters);

  return hasValidName && hasValidInitialCounters;
};

const isPersistedGameState = (value: unknown): value is PersistedGameState => {
  if (!isObject(value)) {
    return false;
  }

  const mode = value.gameMode;
  const theme = value.theme;

  return (
    Array.isArray(value.players) &&
    value.players.every(isPlayer) &&
    Array.isArray(value.turnStartPlayers) &&
    value.turnStartPlayers.every(isPlayer) &&
    Array.isArray(value.turnRecords) &&
    value.turnRecords.every(isTurnRecord) &&
    isNumber(value.startingPlayerIndex) &&
    isNumber(value.turnNumber) &&
    isNumber(value.currentPlayerIndex) &&
    (mode === null || mode === 'shared' || mode === 'multiplayer') &&
    Array.isArray(value.counterDefinitions) &&
    value.counterDefinitions.every(isCounterDefinition) &&
    isNumber(value.defaultPlayerCount) &&
    Array.isArray(value.playerOverrides) &&
    value.playerOverrides.every(isPlayerOverride) &&
    isBoolean(value.eliminationEnabled) &&
    isString(value.eliminationCounterId) &&
    isNumber(value.eliminationThreshold) &&
    (value.eliminationOutcome === 'loss' || value.eliminationOutcome === 'win') &&
    (value.eliminationRule === 'stayAboveMinimum' || value.eliminationRule === 'reachMinimum') &&
    isString(value.currentGameConfigName) &&
    (theme === 'generic' || theme === 'starRealms')
  );
};

export const loadPersistedGameState = async (): Promise<PersistedGameState | null> => {
  const raw = await localforage.getItem<unknown>(GAME_STATE_KEY);
  if (!isPersistedGameState(raw)) {
    return null;
  }
  return raw;
};

export const savePersistedGameState = async (state: PersistedGameState): Promise<void> => {
  await localforage.setItem(GAME_STATE_KEY, state);
};
