import assert from 'node:assert/strict';
import { useGameStore } from '../src/store/gameStore';

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

async function main() {
  try {
    runBehaviorTest();
    // saveGame is async and may log shortly after actions; keep filter active briefly.
    await new Promise((resolve) => setTimeout(resolve, 25));
  } finally {
    console.error = originalConsoleError;
  }
}

main();
