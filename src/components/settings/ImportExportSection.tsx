import React from 'react';

interface Props {
  onImport: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onExport: () => void;
  configMessage: string;
}

export const ImportExportSection: React.FC<Props> = ({ onImport, onExport, configMessage }) => (
  <div className="card">
    <h2 className="mt-0">Game Config Import / Export</h2>
    <p className="text-muted-soft mb-12">
      Import JSON/YAML, or export current settings to YAML.
    </p>
    <div className="controls-row controls-start">
      <label className="btn btn-secondary cursor-pointer">
        Import JSON/YAML
        <input
          type="file"
          accept=".json,.yaml,.yml"
          onChange={onImport}
          className="hidden-file-input"
        />
      </label>
      <button className="btn btn-secondary" onClick={onExport}>
        Export YAML
      </button>
    </div>
    {configMessage && <p className="text-muted mt-10">{configMessage}</p>}
  </div>
);
