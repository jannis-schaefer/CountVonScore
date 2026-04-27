export type EliminationOutcome = 'loss' | 'win';
export type EliminationRule = 'stayAboveMinimum' | 'reachMinimum';

export interface EliminationConfig {
  enabled: boolean;
  counterId: string;
  threshold: number;
  outcome: EliminationOutcome;
  rule: EliminationRule;
}

export interface EliminationPlayer {
  id: string;
  counters: Record<string, number>;
}

export interface PlayerEliminationStatus {
  isOutOfTurnRotation: boolean;
  outcome: EliminationOutcome | null;
  placement: number | null;
  label: string | null;
}

export const isPlayerMatchingEliminationRule = (
  player: EliminationPlayer,
  config: EliminationConfig
): boolean => {
  if (!config.enabled) {
    return false;
  }

  const monitoredValue = player.counters[config.counterId] ?? 0;
  if (config.rule === 'reachMinimum') {
    return monitoredValue >= config.threshold;
  }

  return monitoredValue <= config.threshold;
};

const isPlayerOutOfTurnRotation = (
  player: EliminationPlayer,
  config: EliminationConfig
): boolean => {
  return isPlayerMatchingEliminationRule(player, config);
};

const comparePlayersForPlacement = (
  left: EliminationPlayer,
  right: EliminationPlayer,
  counterId: string
): number => {
  const leftValue = left.counters[counterId] ?? 0;
  const rightValue = right.counters[counterId] ?? 0;
  return rightValue - leftValue;
};

export const evaluatePlayerEliminationStatus = (
  player: EliminationPlayer,
  players: EliminationPlayer[],
  config: EliminationConfig
): PlayerEliminationStatus => {
  if (!config.enabled || !isPlayerMatchingEliminationRule(player, config)) {
    return {
      isOutOfTurnRotation: false,
      outcome: null,
      placement: null,
      label: null,
    };
  }

  if (config.outcome === 'loss') {
    return {
      isOutOfTurnRotation: true,
      outcome: 'loss',
      placement: null,
      label: 'Eliminated',
    };
  }

  const qualifiedPlayers = players
    .filter((candidate) => isPlayerMatchingEliminationRule(candidate, config))
    .slice()
    .sort((left, right) => comparePlayersForPlacement(left, right, config.counterId));
  const placement = Math.max(1, qualifiedPlayers.findIndex((candidate) => candidate.id === player.id) + 1);

  return {
    isOutOfTurnRotation: true,
    outcome: 'win',
    placement,
    label: `Placed #${placement}`,
  };
};

export const getNextActivePlayerIndex = (
  players: EliminationPlayer[],
  fromIndex: number,
  config: EliminationConfig
): number => {
  if (players.length === 0) {
    return 0;
  }

  if (!config.enabled) {
    return (fromIndex + 1 + players.length) % players.length;
  }

  const aliveIndexes = players
    .map((player, index) => ({ player, index }))
    .filter(({ player }) => !isPlayerOutOfTurnRotation(player, config))
    .map(({ index }) => index);

  if (aliveIndexes.length === 0) {
    return Math.max(0, Math.min(fromIndex, players.length - 1));
  }

  const start = (fromIndex + 1 + players.length) % players.length;
  for (let offset = 0; offset < players.length; offset += 1) {
    const candidate = (start + offset) % players.length;
    if (aliveIndexes.includes(candidate)) {
      return candidate;
    }
  }

  return aliveIndexes[0];
};

export const ensureCurrentPlayerIndex = (
  players: EliminationPlayer[],
  currentIndex: number,
  config: EliminationConfig
): number => {
  if (players.length === 0) {
    return 0;
  }

  const boundedIndex = Math.max(0, Math.min(currentIndex, players.length - 1));
  if (!config.enabled || !isPlayerOutOfTurnRotation(players[boundedIndex], config)) {
    return boundedIndex;
  }

  return getNextActivePlayerIndex(players, boundedIndex - 1, config);
};
