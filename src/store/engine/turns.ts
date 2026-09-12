import { getNextActivePlayerIndex, isPlayerMatchingEliminationRule, type EliminationConfig } from './elimination';

export interface CounterDefinition {
  id: string;
  initialValue: number;
  persistsBetweenTurns: boolean;
}

export interface Player {
  id: string;
  name: string;
  counters: Record<string, number>;
}

export interface TurnRecord {
  actingPlayerId: string;
  startPlayers: Player[];
  endPlayers: Player[];
  latestKeyTurnNumber: number;
}

export interface TurnDeltaEntry {
  playerId: string;
  counters: Record<string, number>;
}

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

export const getLatestKeyTurnNumber = (turnNumber: number, keyTurnInterval = 8): number => {
  return turnNumber - ((turnNumber - 1) % keyTurnInterval);
};

const buildTurnDelta = (startPlayers: Player[], endPlayers: Player[]): TurnDeltaEntry[] => {
  return endPlayers.map((endPlayer) => {
    const startPlayer = startPlayers.find((player) => player.id === endPlayer.id);
    const counterKeys = new Set<string>([
      ...Object.keys(startPlayer?.counters ?? {}),
      ...Object.keys(endPlayer.counters),
    ]);

    const counters = Array.from(counterKeys).reduce<Record<string, number>>((acc, counterId) => {
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

    const counters = Object.entries(playerDelta.counters).reduce<Record<string, number>>(
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

export const finalizeTurnState = (input: {
  players: Player[];
  turnStartPlayers: Player[];
  currentPlayerIndex: number;
  turnNumber: number;
  turnRecords: TurnRecord[];
  counterDefinitions: CounterDefinition[];
  eliminationConfig: EliminationConfig;
}): {
  players: Player[];
  turnStartPlayers: Player[];
  turnRecords: TurnRecord[];
  turnNumber: number;
  currentPlayerIndex: number;
} | null => {
  const currentPlayer = input.players[input.currentPlayerIndex];
  if (!currentPlayer) {
    return null;
  }

  const finalizedPlayers = clonePlayers(input.players);
  const newTurnRecord: TurnRecord = {
    actingPlayerId: currentPlayer.id,
    startPlayers: clonePlayers(input.turnStartPlayers),
    endPlayers: finalizedPlayers,
    latestKeyTurnNumber: getLatestKeyTurnNumber(input.turnNumber),
  };

  const nextPlayers = transitionToNextTurnStart(
    finalizedPlayers,
    input.currentPlayerIndex,
    input.counterDefinitions
  );
  const nextTurnNumber = input.turnNumber + 1;
  const nextPlayerIndex = getNextActivePlayerIndex(
    nextPlayers,
    input.currentPlayerIndex,
    input.eliminationConfig
  );

  return {
    players: nextPlayers,
    turnStartPlayers: clonePlayers(nextPlayers),
    turnRecords: [...input.turnRecords, newTurnRecord],
    turnNumber: nextTurnNumber,
    currentPlayerIndex: nextPlayerIndex,
  };
};

export const applyHistoricalChangesState = (input: {
  viewedTurnNumber: number | null;
  viewedPlayers: Player[] | null;
  turnRecords: TurnRecord[];
  currentPlayerIndex: number;
  turnStartPlayers: Player[];
  players: Player[];
  counterDefinitions: CounterDefinition[];
  eliminationConfig: EliminationConfig;
}): {
  players: Player[];
  turnStartPlayers: Player[];
  turnRecords: TurnRecord[];
} | null => {
  if (input.viewedTurnNumber === null || !input.viewedPlayers) {
    return null;
  }

  const editedTurnNumber = input.viewedTurnNumber;
  const editedIndexFromTurn = editedTurnNumber - 1;
  if (editedIndexFromTurn < 0 || editedIndexFromTurn >= input.turnRecords.length) {
    return null;
  }

  const updatedRecords = cloneTurnRecords(input.turnRecords);
  updatedRecords[editedIndexFromTurn] = {
    ...updatedRecords[editedIndexFromTurn],
    endPlayers: clonePlayers(input.viewedPlayers),
    actingPlayerId:
      updatedRecords[editedIndexFromTurn].actingPlayerId ||
      updatedRecords[editedIndexFromTurn].startPlayers[input.currentPlayerIndex]?.id ||
      updatedRecords[editedIndexFromTurn].startPlayers[0]?.id ||
      '',
    latestKeyTurnNumber: getLatestKeyTurnNumber(editedTurnNumber),
  };

  for (let index = editedIndexFromTurn + 1; index < updatedRecords.length; index += 1) {
    const previousRecord = updatedRecords[index - 1];
    const originalRecord = updatedRecords[index];
    const previousTurnPlayerIndex = Math.max(
      0,
      previousRecord.endPlayers.findIndex((player) => player.id === previousRecord.actingPlayerId)
    );
    const nextStartPlayers = transitionToNextTurnStart(
      previousRecord.endPlayers,
      previousTurnPlayerIndex,
      input.counterDefinitions
    );

    const originalDelta = buildTurnDelta(originalRecord.startPlayers, originalRecord.endPlayers);

    updatedRecords[index] = {
      ...originalRecord,
      actingPlayerId:
        nextStartPlayers[
          getNextActivePlayerIndex(nextStartPlayers, previousTurnPlayerIndex, input.eliminationConfig)
        ]?.id ?? nextStartPlayers[0]?.id ?? '',
      startPlayers: nextStartPlayers,
      endPlayers: applyTurnDelta(nextStartPlayers, originalDelta),
      latestKeyTurnNumber: getLatestKeyTurnNumber(index + 1),
    };
  }

  const recalculatedCurrentTurnStart =
    updatedRecords.length > 0
      ? transitionToNextTurnStart(
          updatedRecords[updatedRecords.length - 1].endPlayers,
          Math.max(
            0,
            updatedRecords[updatedRecords.length - 1].endPlayers.findIndex(
              (player) => player.id === updatedRecords[updatedRecords.length - 1].actingPlayerId
            )
          ),
          input.counterDefinitions
        )
      : clonePlayers(input.turnStartPlayers);

  const currentTurnDelta = buildTurnDelta(input.turnStartPlayers, input.players);
  const recalculatedPlayers = applyTurnDelta(recalculatedCurrentTurnStart, currentTurnDelta);

  return {
    players: recalculatedPlayers,
    turnStartPlayers: clonePlayers(recalculatedCurrentTurnStart),
    turnRecords: updatedRecords,
  };
};

export const continueFromHistoricalTurnState = (input: {
  viewedTurnNumber: number | null;
  viewedPlayers: Player[] | null;
  turnRecords: TurnRecord[];
  counterDefinitions: CounterDefinition[];
  eliminationConfig: EliminationConfig;
}): {
  players: Player[];
  turnStartPlayers: Player[];
  turnRecords: TurnRecord[];
  turnNumber: number;
  currentPlayerIndex: number;
} | null => {
  if (input.viewedTurnNumber === null || !input.viewedPlayers) {
    return null;
  }

  const editedTurnNumber = input.viewedTurnNumber;
  const editedIndex = editedTurnNumber - 1;
  if (editedIndex < 0 || editedIndex >= input.turnRecords.length) {
    return null;
  }

  const updatedRecords = cloneTurnRecords(input.turnRecords.slice(0, editedIndex + 1));
  const editedRecord = updatedRecords[editedIndex];
  updatedRecords[editedIndex] = {
    ...editedRecord,
    endPlayers: clonePlayers(input.viewedPlayers),
    actingPlayerId: editedRecord.actingPlayerId || editedRecord.startPlayers[0]?.id || '',
    latestKeyTurnNumber: getLatestKeyTurnNumber(editedTurnNumber),
  };

  const editedPlayerIndex = Math.max(
    0,
    updatedRecords[editedIndex].endPlayers.findIndex(
      (player) => player.id === updatedRecords[editedIndex].actingPlayerId
    )
  );

  const nextPlayers = transitionToNextTurnStart(
    updatedRecords[editedIndex].endPlayers,
    editedPlayerIndex,
    input.counterDefinitions
  );
  const nextTurnNumber = input.viewedTurnNumber + 1;
  const nextPlayerIndex = getNextActivePlayerIndex(
    nextPlayers,
    editedPlayerIndex,
    input.eliminationConfig
  );

  return {
    players: nextPlayers,
    turnStartPlayers: clonePlayers(nextPlayers),
    turnRecords: updatedRecords,
    turnNumber: nextTurnNumber,
    currentPlayerIndex: nextPlayerIndex,
  };
};

export interface PhantomTurn {
  turnIndex: number;
  playerId: string;
}

interface ForwardExcludingPhantomsResult {
  phantoms: PhantomTurn[];
  keptRecords: TurnRecord[];
  runningPlayers: Player[];
}

const computeForwardExcludingPhantoms = (input: {
  turnRecords: TurnRecord[];
  editedIndexFromTurn: number;
  counterDefinitions: CounterDefinition[];
  eliminationConfig: EliminationConfig;
}): ForwardExcludingPhantomsResult => {
  const phantoms: PhantomTurn[] = [];
  const keptRecords: TurnRecord[] = [];

  let runningPlayers = clonePlayers(input.turnRecords[input.editedIndexFromTurn].endPlayers);
  let keptCount = 0;

  for (let index = input.editedIndexFromTurn + 1; index < input.turnRecords.length; index += 1) {
    const originalRecord = input.turnRecords[index];
    const actorIndex = runningPlayers.findIndex((player) => player.id === originalRecord.actingPlayerId);
    const actor = actorIndex >= 0 ? runningPlayers[actorIndex] : undefined;

    if (actor && isPlayerMatchingEliminationRule(actor, input.eliminationConfig)) {
      phantoms.push({ turnIndex: index, playerId: originalRecord.actingPlayerId });
      continue;
    }

    const turnStart = clonePlayers(runningPlayers);
    const originalDelta = buildTurnDelta(originalRecord.startPlayers, originalRecord.endPlayers);
    const turnEnd = applyTurnDelta(turnStart, originalDelta);

    keptCount += 1;
    keptRecords.push({
      actingPlayerId: originalRecord.actingPlayerId,
      startPlayers: turnStart,
      endPlayers: turnEnd,
      latestKeyTurnNumber: getLatestKeyTurnNumber(input.editedIndexFromTurn + 1 + keptCount),
    });

    runningPlayers = transitionToNextTurnStart(
      turnEnd,
      Math.max(0, actorIndex),
      input.counterDefinitions
    );
  }

  return { phantoms, keptRecords, runningPlayers };
};

export const findPhantomTurns = (input: {
  viewedTurnNumber: number | null;
  turnRecords: TurnRecord[];
  counterDefinitions: CounterDefinition[];
  eliminationConfig: EliminationConfig;
}): PhantomTurn[] => {
  if (!input.eliminationConfig.enabled || input.viewedTurnNumber === null) {
    return [];
  }

  const editedIndexFromTurn = input.viewedTurnNumber - 1;
  if (editedIndexFromTurn < 0 || editedIndexFromTurn >= input.turnRecords.length) {
    return [];
  }

  return computeForwardExcludingPhantoms({
    turnRecords: input.turnRecords,
    editedIndexFromTurn,
    counterDefinitions: input.counterDefinitions,
    eliminationConfig: input.eliminationConfig,
  }).phantoms;
};

export const removePhantomTurnsState = (input: {
  viewedTurnNumber: number | null;
  turnRecords: TurnRecord[];
  currentPlayerIndex: number;
  turnStartPlayers: Player[];
  players: Player[];
  counterDefinitions: CounterDefinition[];
  eliminationConfig: EliminationConfig;
}): {
  players: Player[];
  turnStartPlayers: Player[];
  turnRecords: TurnRecord[];
} | null => {
  if (input.viewedTurnNumber === null) {
    return null;
  }

  const editedIndexFromTurn = input.viewedTurnNumber - 1;
  if (editedIndexFromTurn < 0 || editedIndexFromTurn >= input.turnRecords.length) {
    return null;
  }

  const editedRecord = input.turnRecords[editedIndexFromTurn];
  const { keptRecords, runningPlayers } = computeForwardExcludingPhantoms({
    turnRecords: input.turnRecords,
    editedIndexFromTurn,
    counterDefinitions: input.counterDefinitions,
    eliminationConfig: input.eliminationConfig,
  });

  const updatedRecords = [
    ...input.turnRecords.slice(0, editedIndexFromTurn),
    {
      ...editedRecord,
      latestKeyTurnNumber: getLatestKeyTurnNumber(editedIndexFromTurn + 1),
    },
    ...keptRecords,
  ];

  const currentDelta = buildTurnDelta(input.turnStartPlayers, input.players);
  const recalculatedPlayers = applyTurnDelta(runningPlayers, currentDelta);

  return {
    players: recalculatedPlayers,
    turnStartPlayers: clonePlayers(runningPlayers),
    turnRecords: updatedRecords,
  };
};
