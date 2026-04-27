import React from 'react';

interface Props {
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onExport: () => void;
  configMessage: string;
}

export const ImportExportSection: React.FC<Props> = ({ onImport, onExport, configMessage }) => (
  <div className="card">
    <h2 style={{ marginTop: 0 }}>Game Config Import / Export</h2>
    <p style={{ opacity: 0.75, marginBottom: '12px' }}>
      Import JSON/YAML, or export current settings to YAML.
    </p>
    <div className="controls-row" style={{ justifyContent: 'flex-start' }}>
      <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
        Import JSON/YAML
        <input
          type="file"
          accept=".json,.yaml,.yml"
          onChange={onImport}
          style={{ display: 'none' }}
        />
      </label>
      <button className="btn btn-secondary" onClick={onExport}>
        Export YAML
      </button>
    </div>
    {configMessage && <p style={{ marginTop: '10px', opacity: 0.8 }}>{configMessage}</p>}
  </div>
);
