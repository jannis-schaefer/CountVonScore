import React from 'react';
import type { EliminationOutcome, EliminationRule } from '../../store/engine/elimination';
import type { CounterDefinition } from '../../store/gameStore';

interface Props {
  editableEliminationEnabled: boolean;
  setEditableEliminationEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  editableEliminationCounterId: string;
  setEditableEliminationCounterId: React.Dispatch<React.SetStateAction<string>>;
  editableEliminationThreshold: number;
  setEditableEliminationThreshold: React.Dispatch<React.SetStateAction<number>>;
  editableEliminationOutcome: EliminationOutcome;
  setEditableEliminationOutcome: React.Dispatch<React.SetStateAction<EliminationOutcome>>;
  editableEliminationRule: EliminationRule;
  setEditableEliminationRule: React.Dispatch<React.SetStateAction<EliminationRule>>;
  editableCounters: CounterDefinition[];
}

export const EliminationSection: React.FC<Props> = ({
  editableEliminationEnabled,
  setEditableEliminationEnabled,
  editableEliminationCounterId,
  setEditableEliminationCounterId,
  editableEliminationThreshold,
  setEditableEliminationThreshold,
  editableEliminationOutcome,
  setEditableEliminationOutcome,
  editableEliminationRule,
  setEditableEliminationRule,
  editableCounters,
}) => (
  <div className="card">
    <h2 style={{ marginTop: 0 }}>Elimination / Win Condition</h2>
    <p style={{ opacity: 0.75, marginBottom: '12px' }}>
      Configure whether players are removed from turn rotation by losing or by finishing in placement order.
    </p>
    <div className="settings-grid">
      <div className="toggle-row">
        <label htmlFor="elimination-enabled">Enable Elimination</label>
        <input
          id="elimination-enabled"
          type="checkbox"
          checked={editableEliminationEnabled}
          onChange={(event) => setEditableEliminationEnabled(event.target.checked)}
        />
      </div>

      <div className="settings-row">
        <label>Outcome Type</label>
        <select
          className="input"
          value={editableEliminationOutcome}
          onChange={(event) => setEditableEliminationOutcome(event.target.value as EliminationOutcome)}
        >
          <option value="loss">Loss Elimination</option>
          <option value="win">Winning Placement</option>
        </select>
      </div>

      <div className="settings-row">
        <label>Trigger Rule</label>
        <select
          className="input"
          value={editableEliminationRule}
          onChange={(event) => setEditableEliminationRule(event.target.value as EliminationRule)}
        >
          <option value="stayAboveMinimum">Minimum counter to stay above</option>
          <option value="reachMinimum">Minimum counter to reach</option>
        </select>
      </div>

      <div className="settings-row">
        <label>Monitored Counter</label>
        <select
          className="input"
          value={editableEliminationCounterId}
          onChange={(event) => setEditableEliminationCounterId(event.target.value)}
        >
          {editableCounters.map((counter) => (
            <option key={counter.id} value={counter.id}>
              {counter.name}
            </option>
          ))}
        </select>
      </div>

      <div className="settings-row">
        <label>Threshold</label>
        <input
          type="number"
          className="input"
          value={editableEliminationThreshold}
          onChange={(event) => setEditableEliminationThreshold(Number(event.target.value || 0))}
        />
      </div>
    </div>
  </div>
);
