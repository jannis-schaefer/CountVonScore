import React from 'react';
import type { GameConfig } from '../../store/gameStore';

interface Props {
  bundledConfigs: GameConfig[];
  onSelectConfig: (config: GameConfig) => void;
  setConfigMessage: React.Dispatch<React.SetStateAction<string>>;
}

export const BundledPresetsSection: React.FC<Props> = ({
  bundledConfigs,
  onSelectConfig,
  setConfigMessage,
}) => (
  <div className="card">
    <h2 className="mt-0">Bundled Game Formats</h2>
    <p className="text-muted mb-15">
      Bundled presets are loaded from YAML files in public/configs.
    </p>
    <div className="controls-row controls-start">
      {bundledConfigs.map((config) => (
        <button
          key={config.name ?? JSON.stringify(config)}
          className="btn btn-secondary"
          onClick={() => {
            onSelectConfig(config);
            setConfigMessage(`Loaded bundled config into draft: ${config.name ?? 'Unnamed config'}`);
          }}
        >
          {config.name ?? 'Unnamed config'}
        </button>
      ))}
    </div>
  </div>
);
