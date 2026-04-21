import React, { useState } from 'react';
import type { CounterDefinition, Player } from '../store/gameStore';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  counterDefinitions: CounterDefinition[];
  onCounterChange: (counterId: string, value: number) => void;
  compact?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isActive,
  counterDefinitions,
  onCounterChange,
  compact = false,
}) => {
  const [editingCounter, setEditingCounter] = useState<string | null>(null);

  const handleCounterClick = (counterId: string) => {
    setEditingCounter(counterId);
  };

  const handleCounterInputChange = (counterId: string, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      onCounterChange(counterId, numValue);
    }
  };

  const renderCounter = (counter: CounterDefinition) => (
    <div key={counter.id} className="stack" style={{ marginBottom: '15px' }}>
      <div className="counter-label">{counter.name}</div>
      <div
        className="counter-display"
        onClick={() => handleCounterClick(counter.id)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        {editingCounter === counter.id ? (
          <input
            className="input"
            type="number"
            value={player.counters[counter.id] ?? 0}
            onChange={(e) => handleCounterInputChange(counter.id, e.target.value)}
            onBlur={() => setEditingCounter(null)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setEditingCounter(null);
              }
            }}
            autoFocus
            style={{ width: '100px', textAlign: 'center', fontSize: '2rem' }}
          />
        ) : (
          player.counters[counter.id] ?? 0
        )}
      </div>
      <div className="counter-controls">
        <button
          className="counter-btn"
          onClick={() => onCounterChange(counter.id, (player.counters[counter.id] ?? 0) - 1)}
        >
          −
        </button>
        <button
          className="counter-btn"
          onClick={() => onCounterChange(counter.id, (player.counters[counter.id] ?? 0) + 1)}
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className={`player-card ${isActive ? 'active' : ''}`}>
      <div className="player-name">{player.name}</div>
      {counterDefinitions
        .filter((counter) => isActive || counter.alwaysDisplayed)
        .map((counter) => renderCounter(counter))}

      {!isActive && compact && (
        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          Non-active view
        </div>
      )}
    </div>
  );
};
