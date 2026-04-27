import React from 'react';

interface Props {
  editableDefaultPlayerCount: number;
  setEditableDefaultPlayerCount: React.Dispatch<React.SetStateAction<number>>;
  overridesText: string;
  setOverridesText: React.Dispatch<React.SetStateAction<string>>;
}

export const PlayerDefaultsSection: React.FC<Props> = ({
  editableDefaultPlayerCount,
  setEditableDefaultPlayerCount,
  overridesText,
  setOverridesText,
}) => (
  <div className="card">
    <h2 style={{ marginTop: 0 }}>Player Defaults &amp; Overrides</h2>
    <div className="settings-grid">
      <div className="settings-row">
        <label>Default Player Count</label>
        <input
          type="number"
          min={1}
          className="input"
          value={editableDefaultPlayerCount}
          onChange={(event) =>
            setEditableDefaultPlayerCount(Math.max(1, Number(event.target.value || 1)))
          }
        />
      </div>

      <div className="settings-row">
        <label>Player Overrides (JSON)</label>
        <textarea
          className="input"
          value={overridesText}
          onChange={(event) => setOverridesText(event.target.value)}
          rows={8}
          style={{ width: '100%', boxSizing: 'border-box' }}
        />
      </div>
    </div>
  </div>
);
