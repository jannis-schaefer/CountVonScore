import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { loadBundledGameConfigs } from '../utils/gameConfig';
import type { GameConfig } from '../store/gameStore';
import { ConfirmDialog } from '../components/ConfirmDialog';

const defaultConfig: GameConfig = {
  name: 'Default',
  counters: [
    {
      id: 'counter-1',
      name: 'Counter A',
      initialValue: 0,
      persistsBetweenTurns: true,
      alwaysDisplayed: true,
    },
    {
      id: 'counter-2',
      name: 'Counter B',
      initialValue: 0,
      persistsBetweenTurns: true,
      alwaysDisplayed: false,
    },
    {
      id: 'counter-3',
      name: 'Counter C',
      initialValue: 0,
      persistsBetweenTurns: true,
      alwaysDisplayed: false,
    },
  ],
  players: {
    defaultPlayerCount: 2,
    overrides: [],
  },
};

export const ModeSelection: React.FC = () => {
  const navigate = useNavigate();
  const { applyGameConfig, defaultPlayerCount, gameMode, startNewGame } = useGameStore();
  const [mode, setMode] = React.useState<'shared' | 'multiplayer'>(gameMode ?? 'shared');
  const [playerCount, setPlayerCount] = React.useState(Math.max(1, defaultPlayerCount));
  const [bundledConfigs, setBundledConfigs] = React.useState<GameConfig[]>([]);
  const [selectedConfigName, setSelectedConfigName] = React.useState('');
  const [isDirty, setIsDirty] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [pendingPreset, setPendingPreset] = React.useState<GameConfig | null>(null);

  React.useEffect(() => {
    const run = async () => {
      try {
        const configs = await loadBundledGameConfigs();
        setBundledConfigs(configs);
      } catch (error) {
        console.error(error);
        setMessage('Failed to load presets. You can still start with current settings.');
      }
    };

    run();
  }, []);

  const handleStartGame = () => {
    startNewGame({ mode, playerCount });
    navigate(mode === 'shared' ? '/shared' : '/multiplayer');
  };

  const applyPreset = (config: GameConfig) => {
    applyGameConfig(config);
    setSelectedConfigName(config.name ?? 'Preset');
    setPlayerCount(Math.max(1, config.players?.defaultPlayerCount ?? defaultPlayerCount));
    setIsDirty(false);
    setMessage(`Loaded preset: ${config.name ?? 'Preset'}. You can edit settings before starting.`);
  };

  const handleApplyPreset = (config: GameConfig) => {
    if (isDirty) {
      setPendingPreset(config);
      return;
    }

    applyPreset(config);
  };

  return (
    <div className="page-center">
      <div className="page-wrap stack" style={{ maxWidth: '900px' }}>
        <div className="stack" style={{ textAlign: 'center', gap: '8px' }}>
          <h1 className="header-title" style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}>
            New Game
          </h1>
          <p style={{ opacity: 0.85, maxWidth: '640px', margin: '0 auto' }}>
            Choose how this device will be used: shared table tracking or single-player tracking.
          </p>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Mode</h2>
          <div className="controls-row" style={{ justifyContent: 'flex-start' }}>
            <button
              className={`btn ${mode === 'shared' ? '' : 'btn-secondary'}`}
              onClick={() => {
                setMode('shared');
                setIsDirty(true);
              }}
            >
              Shared Device (All Players)
            </button>
            <button
              className={`btn ${mode === 'multiplayer' ? '' : 'btn-secondary'}`}
              onClick={() => {
                setMode('multiplayer');
                setIsDirty(true);
              }}
            >
              Personal Device (One Player)
            </button>
          </div>
          <p style={{ opacity: 0.75, marginTop: '10px', marginBottom: 0 }}>
            Shared Device is for one phone/tablet used by everyone. Personal Device is for a single player tracking only their own stats.
          </p>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Preset (Optional)</h2>
          <div className="controls-row" style={{ justifyContent: 'flex-start' }}>
            <button
              className="btn btn-secondary"
              onClick={() => handleApplyPreset(defaultConfig)}
            >
              Use Default
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSelectedConfigName('Current settings');
                setMessage('Using current settings.');
              }}
            >
              Use Current Settings
            </button>
            {bundledConfigs.map((config) => (
              <button
                key={config.name ?? JSON.stringify(config)}
                className="btn btn-secondary"
                onClick={() => handleApplyPreset(config)}
              >
                {config.name ?? 'Unnamed Preset'}
              </button>
            ))}
          </div>
          {selectedConfigName ? (
            <p style={{ opacity: 0.8, marginTop: '10px' }}>Selected: {selectedConfigName}</p>
          ) : null}
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Player Count</h2>
          <input
            type="number"
            min={1}
            className="input"
            value={playerCount}
            onChange={(event) => {
              setPlayerCount(Math.max(1, Number(event.target.value || 1)));
              setIsDirty(true);
            }}
            style={{ width: '120px' }}
          />
        </div>

        <div className="panel">
          <div className="controls-row" style={{ justifyContent: 'space-between' }}>
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/settings', { state: { context: 'new-game-setup' } })}
            >
              Edit Game Settings
            </button>
            <div className="controls-row" style={{ justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => navigate('/')}>
                Cancel
              </button>
              <button className="btn" onClick={handleStartGame}>
                Confirm And Start
              </button>
            </div>
          </div>
          {message ? <p style={{ opacity: 0.8, marginTop: '10px' }}>{message}</p> : null}
        </div>

        <ConfirmDialog
          open={pendingPreset !== null}
          title="Replace Unsaved Setup Changes?"
          message="You have unsaved setup changes. Replace setup with the selected preset?"
          confirmLabel="Replace With Preset"
          cancelLabel="Keep Current Setup"
          onConfirm={() => {
            if (pendingPreset) {
              applyPreset(pendingPreset);
            }
            setPendingPreset(null);
          }}
          onCancel={() => setPendingPreset(null)}
        />
      </div>
    </div>
  );
};
