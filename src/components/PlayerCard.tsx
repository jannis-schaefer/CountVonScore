import React, { useState } from 'react';
import type { CounterDefinition, Player } from '../store/gameStore';

interface PlayerCardProps {
  player: Player;
  isActive: boolean;
  counterDefinitions: CounterDefinition[];
  onCounterChange: (counterId: string, value: number) => void;
  compact?: boolean;
  statusLabel?: string | null;
  isOutOfTurnRotation?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  isActive,
  counterDefinitions,
  onCounterChange,
  compact = false,
  statusLabel,
  isOutOfTurnRotation = false,
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
    <div
      key={counter.id}
      className="stack"
      style={{ marginBottom: '15px' }}
      data-testid={`counter-${player.id}-${counter.id}`}
    >
      <div className="counter-label">{counter.name}</div>
      <div
        className="counter-display"
        onClick={() => handleCounterClick(counter.id)}
        style={{ cursor: 'pointer', userSelect: 'none' }}
        data-testid={`counter-display-${player.id}-${counter.id}`}
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
          data-testid={`counter-dec-${player.id}-${counter.id}`}
        >
          −
        </button>
        <button
          className="counter-btn"
          onClick={() => onCounterChange(counter.id, (player.counters[counter.id] ?? 0) + 1)}
          data-testid={`counter-inc-${player.id}-${counter.id}`}
        >
          +
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`player-card ${isActive ? 'active' : ''}`}
      style={{ opacity: isOutOfTurnRotation ? 0.8 : 1 }}
      data-testid={`player-card-${player.id}`}
    >
      <div className="player-name" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span>{player.name}</span>
        {statusLabel ? (
          <span
            style={{
              fontSize: '0.72rem',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              padding: '2px 8px',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.25)',
              opacity: 0.9,
            }}
          >
            {statusLabel}
          </span>
        ) : null}
      </div>
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
