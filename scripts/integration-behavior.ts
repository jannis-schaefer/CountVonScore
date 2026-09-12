import assert from 'node:assert/strict';
import { useGameStore } from '../src/store/gameStore';
import { findPhantomTurns, removePhantomTurnsState, type TurnRecord, type Player, type CounterDefinition } from '../src/store/engine/turns';
import type { EliminationConfig } from '../src/store/engine/elimination';

const originalConsoleError = console.error;

// In Node test runs localforage persistence may not be available; suppress noisy persistence logs.
console.error = (...args: unknown[]) => {
  const firstArg = args[0];
  if (typeof firstArg === 'string' && firstArg.includes('Failed to save game')) {
    return;
  }
  originalConsoleError(...args);
};

function runBehaviorTest() {
  const store = useGameStore;

  // Persistence is validated elsewhere; disable it here to keep behavior checks deterministic in Node.
  store.setState({ saveGame: async () => {} } as never);

  store.getState().startNewGame({ mode: 'shared', playerCount: 2 });

  const initialState = store.getState();
  const counterId = initialState.counterDefinitions[0]?.id;
  assert.ok(counterId, 'Expected at least one counter definition');

  const player1Id = initialState.players[0]?.id;
  const player2Id = initialState.players[1]?.id;
  assert.ok(player1Id && player2Id, 'Expected two players in minimal game setup');

  const initialPlayer1Value = initialState.players[0].counters[counterId] ?? 0;
  const initialPlayer2Value = initialState.players[1].counters[counterId] ?? 0;

  // Player 1 changes counter: +3 then -1 => net +2
  store.getState().incrementCounter(player1Id, counterId, 3);
  store.getState().decrementCounter(player1Id, counterId, 1);

  let state = store.getState();
  assert.equal(
    state.players[0].counters[counterId],
    initialPlayer1Value + 2,
    'Player 1 counter should reflect increment/decrement changes'
  );

  // Advance turn and verify turn/current player progression + counter persistence.
  store.getState().nextTurn();
  state = store.getState();
  assert.equal(state.turnNumber, 2, 'Turn should advance to 2 after first nextTurn');
  assert.equal(state.currentPlayerIndex, 1, 'Current player should advance to player 2');
  assert.equal(
    state.players[0].counters[counterId],
    initialPlayer1Value + 2,
    'Player 1 counter should persist after turn advancement'
  );

  // Player 2 changes counter then advances turn.
  store.getState().incrementCounter(player2Id, counterId, 5);
  state = store.getState();
  assert.equal(
    state.players[1].counters[counterId],
    initialPlayer2Value + 5,
    'Player 2 counter should update correctly'
  );

  store.getState().nextTurn();
  state = store.getState();
  assert.equal(state.turnNumber, 3, 'Turn should advance to 3 after second nextTurn');
  assert.equal(state.currentPlayerIndex, 0, 'Current player should cycle back to player 1');
  assert.equal(
    state.players[1].counters[counterId],
    initialPlayer2Value + 5,
    'Player 2 counter should persist after turn advancement'
  );

  // Sanity check that turn records were created during turn advancement.
  assert.equal(state.turnRecords.length, 2, 'Expected one turn record per completed turn');

  console.log('Behavior integration checks passed: counter mutations + turn progression + persistence.');
}

function runPhantomTurnTests() {
  const counterId = 'hp';
  const counterDefinitions: CounterDefinition[] = [
    { id: counterId, initialValue: 10, persistsBetweenTurns: true },
  ];
  const eliminationConfig: EliminationConfig = {
    enabled: true,
    counterId,
    threshold: 0,
    outcome: 'loss',
    rule: 'stayAboveMinimum',
  };

  const makePlayer = (id: string, hp: number): Player => ({ id, name: id, counters: { [counterId]: hp } });

  // Turn 1: P1 attacks P3 for 15.
  const turn1Start: Player[] = [makePlayer('p1', 10), makePlayer('p2', 10), makePlayer('p3', 10)];
  const turn1End: Player[] = [makePlayer('p1', 10), makePlayer('p2', 10), makePlayer('p3', -5)];

  // Turn 2: P2 does nothing.
  const turn2Start = turn1End;
  const turn2End = turn1End;

  // Turn 3 (to be edited): originally P3 heals self back to 5.
  const turn3Start = turn2End;
  const turn3OriginalEnd: Player[] = [makePlayer('p1', 10), makePlayer('p2', 10), makePlayer('p3', 5)];

  // Turn 4: P1 attacks P2 for 3.
  const turn4Start = turn3OriginalEnd;
  const turn4End: Player[] = [makePlayer('p1', 10), makePlayer('p2', 7), makePlayer('p3', 5)];

  // Turn 5: P2 heals self by 2.
  const turn5Start = turn4End;
  const turn5End: Player[] = [makePlayer('p1', 10), makePlayer('p2', 9), makePlayer('p3', 5)];

  // Turn 6: P3 attacks P1 for 4.
  const turn6Start = turn5End;
  const turn6End: Player[] = [makePlayer('p1', 6), makePlayer('p2', 9), makePlayer('p3', 5)];

  const originalTurnRecords: TurnRecord[] = [
    { actingPlayerId: 'p1', startPlayers: turn1Start, endPlayers: turn1End, latestKeyTurnNumber: 1 },
    { actingPlayerId: 'p2', startPlayers: turn2Start, endPlayers: turn2End, latestKeyTurnNumber: 1 },
    { actingPlayerId: 'p3', startPlayers: turn3Start, endPlayers: turn3OriginalEnd, latestKeyTurnNumber: 1 },
    { actingPlayerId: 'p1', startPlayers: turn4Start, endPlayers: turn4End, latestKeyTurnNumber: 1 },
    { actingPlayerId: 'p2', startPlayers: turn5Start, endPlayers: turn5End, latestKeyTurnNumber: 1 },
    { actingPlayerId: 'p3', startPlayers: turn6Start, endPlayers: turn6End, latestKeyTurnNumber: 1 },
  ];

  // Apply the historical edit at turn 3: P3 does NOT heal, stays eliminated (-5).
  const editedTurnRecords: TurnRecord[] = originalTurnRecords.map((record, index) =>
    index === 2
      ? { ...record, endPlayers: [makePlayer('p1', 10), makePlayer('p2', 10), makePlayer('p3', -5)] }
      : record
  );

  const phantoms = findPhantomTurns({
    viewedTurnNumber: 3,
    viewedPlayers: editedTurnRecords[2].endPlayers,
    turnRecords: editedTurnRecords,
    counterDefinitions,
    eliminationConfig,
  });

  assert.equal(phantoms.length, 1, 'Expected exactly one phantom turn (P3 turn 6)');
  assert.equal(phantoms[0].turnIndex, 5, 'Phantom turn should be at index 5 (turn 6)');
  assert.equal(phantoms[0].playerId, 'p3', 'Phantom turn should belong to eliminated player p3');

  const removed = removePhantomTurnsState({
    viewedTurnNumber: 3,
    viewedPlayers: editedTurnRecords[2].endPlayers,
    turnRecords: editedTurnRecords,
    currentPlayerIndex: 0,
    turnStartPlayers: turn6End,
    players: turn6End,
    counterDefinitions,
    eliminationConfig,
  });

  assert.ok(removed, 'removePhantomTurnsState should return a result');
  assert.equal(removed!.turnRecords.length, 5, 'Phantom turn should be removed, shrinking turnRecords to 5');

  const finalP1 = removed!.players.find((player) => player.id === 'p1');
  const finalP2 = removed!.players.find((player) => player.id === 'p2');
  const finalP3 = removed!.players.find((player) => player.id === 'p3');

  assert.equal(finalP1?.counters[counterId], 10, 'P1 should NOT take phantom damage from removed turn 6');
  assert.equal(finalP2?.counters[counterId], 9, 'P2 should keep genuine turn 4/5 effects (10-3+2=9)');
  assert.equal(finalP3?.counters[counterId], -5, 'P3 should remain at eliminated value');

  console.log('Phantom turn detection/removal checks passed: elimination-aware recalculation excludes phantom damage.');
}

async function main() {
  try {
    runBehaviorTest();
    runPhantomTurnTests();
    // saveGame is async and may log shortly after actions; keep filter active briefly.
    await new Promise((resolve) => setTimeout(resolve, 25));
  } finally {
    console.error = originalConsoleError;
  }
}

main();
