import React from 'react';
import type { CounterDefinition } from '../../store/gameStore';

const createNewCounter = (index: number): CounterDefinition => ({
  id: `counter-${Date.now()}-${index}`,
  name: `Counter ${index + 1}`,
  initialValue: 0,
  persistsBetweenTurns: true,
  alwaysDisplayed: false,
});

interface Props {
  editableCounters: CounterDefinition[];
  setEditableCounters: React.Dispatch<React.SetStateAction<CounterDefinition[]>>;
  setConfigMessage: React.Dispatch<React.SetStateAction<string>>;
}

export const CounterDefinitionsSection: React.FC<Props> = ({
  editableCounters,
  setEditableCounters,
  setConfigMessage,
}) => (
  <div className="card">
    <h2 className="mt-0">Counter Definitions</h2>
    <p className="text-muted-soft mb-12">
      Counters are fully generic. Use stable ids in configs. Icons are optional and reserved for future UI support.
    </p>

    <div className="settings-grid">
      {editableCounters.map((counter, index) => (
        <div className="panel" key={counter.id}>
          <div className="settings-grid">
            <div className="settings-row">
              <label>ID</label>
              <input
                type="text"
                className="input"
                value={counter.id}
                onChange={(event) => {
                  const next = [...editableCounters];
                  next[index] = { ...counter, id: event.target.value };
                  setEditableCounters(next);
                }}
              />
            </div>

            <div className="settings-row">
              <label>Name</label>
              <input
                type="text"
                className="input"
                value={counter.name}
                onChange={(event) => {
                  const next = [...editableCounters];
                  next[index] = { ...counter, name: event.target.value };
                  setEditableCounters(next);
                }}
              />
            </div>

            <div className="settings-row">
              <label>Icon (optional)</label>
              <input
                type="text"
                className="input"
                value={counter.icon ?? ''}
                onChange={(event) => {
                  const next = [...editableCounters];
                  next[index] = { ...counter, icon: event.target.value || undefined };
                  setEditableCounters(next);
                }}
              />
            </div>

            <div className="settings-row">
              <label>Initial Value</label>
              <input
                type="number"
                className="input"
                value={counter.initialValue}
                onChange={(event) => {
                  const next = [...editableCounters];
                  next[index] = { ...counter, initialValue: Number(event.target.value || 0) };
                  setEditableCounters(next);
                }}
              />
            </div>

            <div className="toggle-row">
              <label htmlFor={`persist-${counter.id}`}>Persists Between Turns</label>
              <input
                id={`persist-${counter.id}`}
                type="checkbox"
                checked={counter.persistsBetweenTurns}
                onChange={(event) => {
                  const next = [...editableCounters];
                  next[index] = { ...counter, persistsBetweenTurns: event.target.checked };
                  setEditableCounters(next);
                }}
              />
            </div>

            <div className="toggle-row">
              <label htmlFor={`always-${counter.id}`}>Always Displayed (non-active players)</label>
              <input
                id={`always-${counter.id}`}
                type="checkbox"
                checked={counter.alwaysDisplayed}
                onChange={(event) => {
                  const next = [...editableCounters];
                  next[index] = { ...counter, alwaysDisplayed: event.target.checked };
                  setEditableCounters(next);
                }}
              />
            </div>

            <button
              className="btn btn-danger"
              onClick={() => {
                if (editableCounters.length <= 1) {
                  setConfigMessage('At least one counter is required.');
                  return;
                }
                setEditableCounters(editableCounters.filter((_, i) => i !== index));
              }}
            >
              Remove Counter
            </button>
          </div>
        </div>
      ))}
    </div>

    <div className="controls-row controls-start mt-10">
      <button
        className="btn btn-secondary"
        onClick={() => setEditableCounters([...editableCounters, createNewCounter(editableCounters.length)])}
      >
        Add Counter
      </button>
    </div>
  </div>
);
