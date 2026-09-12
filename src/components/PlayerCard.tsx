import React, { useEffect, useRef, useState } from 'react';
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
  const [editMode, setEditMode] = useState<'=' | '+'>('=');
  const [editValue, setEditValue] = useState('');
  const [previewDelta, setPreviewDelta] = useState(0);
  const holdTimer = useRef<number | null>(null);
  const held = useRef(false);

  useEffect(() => () => {
    if (holdTimer.current !== null) window.clearTimeout(holdTimer.current);
  }, []);

  const openEdit = (counterId: string, mode: '=' | '+') => {
    const value = player.counters[counterId] ?? 0;
    setEditingCounter(counterId);
    setEditMode(mode);
    setEditValue(mode === '=' ? String(value) : '');
    setPreviewDelta(0);
  };

  const commitEdit = (counter: CounterDefinition) => {
    const number = Number(editValue);
    if (Number.isFinite(number)) {
      const current = player.counters[counter.id] ?? 0;
      onCounterChange(counter.id, editMode === '=' ? number : current + number);
    }
    setEditingCounter(null);
  };

  const renderCounter = (counter: CounterDefinition) => (
    <div
      key={counter.id}
      className="stack"
      style={{ marginBottom: '15px' }}
      data-testid={`counter-${player.id}-${counter.id}`}
    >
      <div className="counter-label">{counter.name}</div>
      {editingCounter === counter.id ? (
        <div className="counter-edit" data-testid={`counter-edit-${player.id}-${counter.id}`}>
          <div className="counter-preview">{previewDelta > 0 ? `+${previewDelta}` : previewDelta < 0 ? previewDelta : ''}</div>
          <div className="counter-edit-mode" role="group" aria-label="Edit mode">
            <button type="button" aria-pressed={editMode === '='} onClick={() => setEditMode('=')}>=</button>
            <button type="button" aria-pressed={editMode === '+'} onClick={() => setEditMode('+')}>+</button>
          </div>
          <input className="input" type="number" value={editValue} autoFocus data-testid={`counter-input-${player.id}-${counter.id}`} onChange={(event) => { setEditValue(event.target.value); setPreviewDelta(editMode === '+' ? Number(event.target.value || 0) : Number(event.target.value || 0) - (player.counters[counter.id] ?? 0)); }} />
          <button type="button" onClick={() => commitEdit(counter)} data-testid={`counter-ok-${player.id}-${counter.id}`}>OK</button>
          <button type="button" onClick={() => setEditingCounter(null)} data-testid={`counter-cancel-${player.id}-${counter.id}`}>Cancel</button>
        </div>
      ) : (
        <div className="counter-controls" data-testid={`counter-controls-${player.id}-${counter.id}`}>
          {(['minus', 'value', 'plus'] as const).map((zone) => zone === 'value' ? (
            <button key={zone} type="button" className="counter-display" data-testid={`counter-display-${player.id}-${counter.id}`} onDoubleClick={() => openEdit(counter.id, '+')} onPointerDown={() => { held.current = false; holdTimer.current = window.setTimeout(() => { held.current = true; openEdit(counter.id, '='); }, 500); }} onPointerUp={() => { if (holdTimer.current !== null) window.clearTimeout(holdTimer.current); }} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') openEdit(counter.id, '='); }}>
              {player.counters[counter.id] ?? 0}
            </button>
          ) : (
            <button key={zone} type="button" className="counter-btn" data-testid={`counter-${zone}-${player.id}-${counter.id}`} onClick={() => { if (held.current) { held.current = false; onCounterChange(counter.id, (player.counters[counter.id] ?? 0) + (zone === 'plus' ? counter.longPressAmount : -counter.longPressAmount)); } else { onCounterChange(counter.id, (player.counters[counter.id] ?? 0) + (zone === 'plus' ? 1 : -1)); } }} onPointerDown={() => { held.current = false; holdTimer.current = window.setTimeout(() => { held.current = true; }, 500); }} onPointerUp={() => { if (holdTimer.current !== null) window.clearTimeout(holdTimer.current); }} aria-label={zone === 'plus' ? 'Increase counter' : 'Decrease counter'}>{zone === 'plus' ? '+' : '−'}</button>
          ))}
        </div>
      )}
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
