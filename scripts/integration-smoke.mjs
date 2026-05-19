#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';

const STORE_FILE = new URL('../src/store/gameStore.ts', import.meta.url);
const source = fs.readFileSync(STORE_FILE, 'utf-8');

const requiredChecks = [
  {
    id: 'incrementCounter mutation',
    pattern: /incrementCounter:\s*\(playerId:\s*string,\s*counterId:\s*string,\s*amount\s*=\s*1\)\s*=>\s*\{/,
  },
  {
    id: 'nextTurn action exists',
    pattern: /nextTurn:\s*\(\)\s*=>\s*\{/,
  },
  {
    id: 'turn finalization called',
    pattern: /const\s+turnResult\s*=\s*finalizeTurnState\(/,
  },
  {
    id: 'turn number advances',
    pattern: /turnNumber:\s*turnResult\.turnNumber/,
  },
  {
    id: 'current player advances',
    pattern: /currentPlayerIndex:\s*turnResult\.currentPlayerIndex/,
  },
];

for (const check of requiredChecks) {
  assert.match(source, check.pattern, `Missing integration invariant: ${check.id}`);
}

console.log('Integration smoke checks passed: counter + turn invariants are present.');
