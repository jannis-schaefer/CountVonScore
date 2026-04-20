import React, { useState } from 'react';
import type { Player, CounterState, CounterFlags } from '../store/gameStore';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  onCounterChange: (counter: keyof CounterState, value: number) => void;
  counterNames: Record<keyof CounterState, string>;
  visibleCounters?: CounterFlags;
  compact?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isActive,
  onCounterChange,
  counterNames,
  visibleCounters,
  compact = false,
}) => {
  const [editingCounter, setEditingCounter] = useState<keyof CounterState | null>(null);

  const handleCounterClick = (counter: keyof CounterState) => {
    setEditingCounter(counter);
  };

  const handleCounterInputChange = (counter: keyof CounterState, value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue)) {
      onCounterChange(counter, numValue);
    }
  };

  const renderCounter = (counter: keyof CounterState) => (
    <div key={counter} className="stack" style={{ marginBottom: '15px' }}>
      <div className="counter-label">{counterNames[counter]}</div>
      <div
        className={`counter-display counter-${counter}`}
        onClick={() => handleCounterClick(counter)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
      >
        {editingCounter === counter ? (
          <input
            className="input"
            type="number"
            value={player.counters[counter]}
            onChange={(e) => handleCounterInputChange(counter, e.target.value)}
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
          player.counters[counter]
        )}
      </div>
      <div className="counter-controls">
        <button
          className="counter-btn"
          onClick={() => onCounterChange(counter, player.counters[counter] - 1)}
        >
          −
        </button>
        <button
          className="counter-btn"
          onClick={() => onCounterChange(counter, player.counters[counter] + 1)}
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div className={`player-card ${isActive ? 'active' : ''}`}>
      <div className="player-name">{player.name}</div>
      {(visibleCounters?.authority ?? true) && renderCounter('authority')}
      {(visibleCounters?.money ?? true) && renderCounter('money')}
      {(visibleCounters?.attack ?? true) && renderCounter('attack')}

      {!isActive && compact && (
        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
          Non-active view
        </div>
      )}
    </div>
  );
};
