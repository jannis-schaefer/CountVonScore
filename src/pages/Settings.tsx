import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useTheme } from '../context/ThemeContext';
import { loadBundledGameConfigs, parseGameConfig, stringifyGameConfigJson } from '../utils/gameConfig';
import type { GameConfig } from '../store/gameStore';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const {
    players,
    counterNames,
    counterResetsOnTurn,
    counterVisibleForNonActive,
    defaultCounterValues,
    currentGameConfigName,
    updateCounterNames,
    updateCounterResetsOnTurn,
    updateCounterVisibleForNonActive,
    updateDefaultCounterValues,
    applyGameConfig,
    addPlayer,
    removePlayer,
    updatePlayerName,
  } = useGameStore();
  const { theme, toggleTheme } = useTheme();

  const [tempCounterNames, setTempCounterNames] = useState(counterNames);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayerIds, setEditingPlayerIds] = useState<Set<string>>(new Set());
  const [editingPlayerNames, setEditingPlayerNames] = useState<Record<string, string>>({});
  const [configMessage, setConfigMessage] = useState<string>('');
  const [bundledConfigs, setBundledConfigs] = useState<GameConfig[]>([]);

  useEffect(() => {
    const run = async () => {
      try {
        const configs = await loadBundledGameConfigs();
        setBundledConfigs(configs);
      } catch (error) {
        console.error(error);
        setConfigMessage('Failed to load bundled game configs.');
      }
    };

    run();
  }, []);

  const handleCounterNameChange = (counter: keyof typeof counterNames, value: string) => {
    setTempCounterNames({ ...tempCounterNames, [counter]: value });
  };

  const handleSaveCounterNames = () => {
    updateCounterNames(tempCounterNames);
  };

  const handleAddPlayer = () => {
    if (newPlayerName.trim()) {
      addPlayer(newPlayerName.trim());
      setNewPlayerName('');
    }
  };

  const handleStartEditPlayer = (id: string, name: string) => {
    setEditingPlayerIds(new Set(editingPlayerIds).add(id));
    setEditingPlayerNames({ ...editingPlayerNames, [id]: name });
  };

  const handleSavePlayerName = (id: string) => {
    const newName = editingPlayerNames[id];
    if (newName.trim()) {
      updatePlayerName(id, newName.trim());
      const newEditing = new Set(editingPlayerIds);
      newEditing.delete(id);
      setEditingPlayerIds(newEditing);
    }
  };

  const handleDeletePlayer = (id: string) => {
    if (players.length > 1) {
      removePlayer(id);
    }
  };

  const handleImportConfig = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      const config = parseGameConfig(content, file.name);
      applyGameConfig(config);

      if (config.counterNames) {
        setTempCounterNames((prev) => ({ ...prev, ...config.counterNames }));
      }

      setConfigMessage(`Imported config: ${config.name ?? file.name}`);
    } catch (error) {
      console.error(error);
      setConfigMessage('Failed to import config. Check JSON/YAML format.');
    } finally {
      event.target.value = '';
    }
  };

  const handleExportConfig = () => {
    const payload = {
      name: currentGameConfigName,
      counterNames,
      counterResetsOnTurn,
      counterVisibleForNonActive,
      defaultCounterValues,
      players: players.map((p) => p.name),
    };
    const blob = new Blob([stringifyGameConfigJson(payload)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeName = currentGameConfigName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.download = `${safeName || 'game-config'}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setConfigMessage(`Exported ${safeName || 'game-config'}.json`);
  };

  return (
    <div className="page-shell">
      <div className="page-wrap settings-grid">
        <div className="header-row">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Back
          </button>
          <h1 className="header-title">Settings</h1>
          <div />
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Theme</h2>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span>Current: {theme === 'generic' ? 'Generic' : 'Star Realms'}</span>
            <span>Config: {currentGameConfigName}</span>
            <button className="btn" onClick={toggleTheme}>
              Switch Theme
            </button>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Counter Labels</h2>
          <div className="settings-row">
            {Object.entries(counterNames).map(([key]) => (
              <div key={key}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.875rem' }}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <input
                  type="text"
                  className="input"
                  value={tempCounterNames[key as keyof typeof counterNames]}
                  onChange={(e) =>
                    handleCounterNameChange(key as keyof typeof counterNames, e.target.value)
                  }
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            ))}
            <button className="btn" onClick={handleSaveCounterNames} style={{ justifySelf: 'end' }}>
              Save Labels
            </button>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Counter Visibility For Non-Active Players</h2>
          <p style={{ opacity: 0.75, marginBottom: '12px' }}>
            Choose which counters stay visible and editable on non-active player cards.
          </p>
          <div className="settings-row">
            {Object.entries(counterVisibleForNonActive).map(([key, value]) => (
              <div className="toggle-row" key={key}>
                <label htmlFor={`visibility-${key}`}>
                  Show {counterNames[key as keyof typeof counterNames]} on non-active players
                </label>
                <input
                  id={`visibility-${key}`}
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    updateCounterVisibleForNonActive({
                      [key]: e.target.checked,
                    } as Partial<typeof counterVisibleForNonActive>)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Default Counter Values</h2>
          <p style={{ opacity: 0.75, marginBottom: '12px' }}>
            New players and game reset will use these starting values.
          </p>
          <div className="settings-row">
            {Object.entries(defaultCounterValues).map(([key, value]) => (
              <div key={key}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.875rem' }}>
                  {counterNames[key as keyof typeof counterNames]}
                </label>
                <input
                  type="number"
                  className="input"
                  value={value}
                  onChange={(e) =>
                    updateDefaultCounterValues({
                      [key]: Number(e.target.value || 0),
                    } as Partial<typeof defaultCounterValues>)
                  }
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Turn Reset Rules</h2>
          <p style={{ opacity: 0.75, marginBottom: '12px' }}>
            Enable per-counter reset when moving to the next player's turn.
          </p>
          <div className="settings-row">
            {Object.entries(counterResetsOnTurn).map(([key, value]) => (
              <div className="toggle-row" key={key}>
                <label htmlFor={`reset-${key}`}>
                  Reset {counterNames[key as keyof typeof counterNames]} between turns
                </label>
                <input
                  id={`reset-${key}`}
                  type="checkbox"
                  checked={value}
                  onChange={(e) =>
                    updateCounterResetsOnTurn({
                      [key]: e.target.checked,
                    } as Partial<typeof counterResetsOnTurn>)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Players</h2>
          <div style={{ marginBottom: '20px' }}>
            {players.map((player) => (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'center',
                  padding: '10px',
                  backgroundColor: 'var(--primary-bg)',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  border: '1px solid var(--border-color)',
                }}
              >
                {editingPlayerIds.has(player.id) ? (
                  <>
                    <input
                      type="text"
                      className="input"
                      value={editingPlayerNames[player.id] || ''}
                      onChange={(e) =>
                        setEditingPlayerNames({
                          ...editingPlayerNames,
                          [player.id]: e.target.value,
                        })
                      }
                      style={{ flex: 1 }}
                    />
                    <button className="btn" onClick={() => handleSavePlayerName(player.id)}>
                      Save
                    </button>
                  </>
                ) : (
                  <>
                    <span style={{ flex: 1 }}>{player.name}</span>
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleStartEditPlayer(player.id, player.name)}
                    >
                      Edit
                    </button>
                  </>
                )}
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeletePlayer(player.id)}
                  disabled={players.length === 1}
                  style={{ opacity: players.length === 1 ? 0.5 : 1 }}
                >
                  Delete
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="input"
              placeholder="New player name"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAddPlayer();
                }
              }}
              style={{ flex: 1 }}
            />
            <button className="btn" onClick={handleAddPlayer} disabled={!newPlayerName.trim()}>
              Add Player
            </button>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Bundled Game Formats</h2>
          <p style={{ opacity: 0.7, marginBottom: '15px' }}>
            These presets are loaded from YAML files bundled with the PWA. New formats can be added with a pull request.
          </p>
          <div className="controls-row" style={{ justifyContent: 'flex-start' }}>
            {bundledConfigs.map((config) => (
              <button
                key={config.name}
                className="btn btn-secondary"
                onClick={() => {
                  applyGameConfig(config);
                  if (config.counterNames) {
                    setTempCounterNames((prev) => ({ ...prev, ...config.counterNames }));
                  }
                  setConfigMessage(`Applied bundled config: ${config.name ?? 'Unnamed config'}`);
                }}
              >
                {config.name ?? 'Unnamed config'}
              </button>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Game Config Import/Export</h2>
          <p style={{ opacity: 0.75, marginBottom: '12px' }}>
            Share presets with community using JSON or YAML.
          </p>
          <div className="controls-row" style={{ justifyContent: 'flex-start' }}>
            <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
              Import JSON/YAML
              <input
                type="file"
                accept=".json,.yaml,.yml"
                onChange={handleImportConfig}
                style={{ display: 'none' }}
              />
            </label>
            <button className="btn btn-secondary" onClick={handleExportConfig}>
              Export JSON
            </button>
          </div>
          {configMessage && <p style={{ marginTop: '10px', opacity: 0.8 }}>{configMessage}</p>}
        </div>
      </div>
    </div>
  );
};
