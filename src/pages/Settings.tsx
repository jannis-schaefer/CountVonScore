import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useTheme } from '../context/ThemeContext';
import { loadBundledGameConfigs, parseGameConfig, stringifyGameConfigYaml } from '../utils/gameConfig';
import type { CounterDefinition, GameConfig, PlayerOverride } from '../store/gameStore';

const createNewCounter = (index: number): CounterDefinition => ({
  id: `counter-${Date.now()}-${index}`,
  name: `Counter ${index + 1}`,
  initialValue: 0,
  persistsBetweenTurns: true,
  alwaysDisplayed: false,
});

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const {
    players,
    counterDefinitions,
    defaultPlayerCount,
    playerOverrides,
    eliminationEnabled,
    eliminationCounterId,
    eliminationThreshold,
    currentGameConfigName,
    setCounterDefinitions,
    setDefaultPlayerCount,
    setPlayerOverrides,
    setEliminationConfig,
    setCurrentGameConfigName,
    addPlayer,
    removePlayer,
    updatePlayerName,
  } = useGameStore();
  const { theme, toggleTheme } = useTheme();

  const [editableCounters, setEditableCounters] = useState<CounterDefinition[]>(counterDefinitions);
  const [editableDefaultPlayerCount, setEditableDefaultPlayerCount] = useState<number>(defaultPlayerCount);
  const [overridesText, setOverridesText] = useState<string>(JSON.stringify(playerOverrides, null, 2));
  const [editableEliminationEnabled, setEditableEliminationEnabled] = useState<boolean>(eliminationEnabled);
  const [editableEliminationCounterId, setEditableEliminationCounterId] =
    useState<string>(eliminationCounterId);
  const [editableEliminationThreshold, setEditableEliminationThreshold] =
    useState<number>(eliminationThreshold);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayerIds, setEditingPlayerIds] = useState<Set<string>>(new Set());
  const [editingPlayerNames, setEditingPlayerNames] = useState<Record<string, string>>({});
  const [configName, setConfigName] = useState(currentGameConfigName);
  const [bundledConfigs, setBundledConfigs] = useState<GameConfig[]>([]);
  const [configMessage, setConfigMessage] = useState('');

  useEffect(() => {
    setEditableCounters(counterDefinitions);
  }, [counterDefinitions]);

  useEffect(() => {
    setOverridesText(JSON.stringify(playerOverrides, null, 2));
  }, [playerOverrides]);

  useEffect(() => {
    setEditableDefaultPlayerCount(defaultPlayerCount);
  }, [defaultPlayerCount]);

  useEffect(() => {
    setEditableEliminationEnabled(eliminationEnabled);
  }, [eliminationEnabled]);

  useEffect(() => {
    setEditableEliminationCounterId(eliminationCounterId);
  }, [eliminationCounterId]);

  useEffect(() => {
    setEditableEliminationThreshold(eliminationThreshold);
  }, [eliminationThreshold]);

  useEffect(() => {
    setConfigName(currentGameConfigName);
  }, [currentGameConfigName]);

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

  const canSaveCounters = useMemo(() => {
    return (
      editableCounters.length > 0 &&
      editableCounters.every((counter) => counter.id.trim() && counter.name.trim())
    );
  }, [editableCounters]);

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
    if (newName?.trim()) {
      updatePlayerName(id, newName.trim());
      const next = new Set(editingPlayerIds);
      next.delete(id);
      setEditingPlayerIds(next);
    }
  };

  const handleDeletePlayer = (id: string) => {
    if (players.length > 1) {
      removePlayer(id);
    }
  };

  const applyConfigToDraft = (config: GameConfig) => {
    const nextCounters = (config.counters ?? []).map((counter, index) => ({
      id: counter.id?.trim() || `counter-${Date.now()}-${index}`,
      name: counter.name,
      icon: counter.icon,
      initialValue: counter.initialValue,
      persistsBetweenTurns: counter.persistsBetweenTurns,
      alwaysDisplayed: counter.alwaysDisplayed,
    }));

    if (nextCounters.length > 0) {
      setEditableCounters(nextCounters);
    }

    setConfigName(config.name ?? '');
    setEditableDefaultPlayerCount(
      Math.max(1, Number(config.players?.defaultPlayerCount ?? defaultPlayerCount ?? 1))
    );
    setOverridesText(JSON.stringify(config.players?.overrides ?? [], null, 2));
    setEditableEliminationEnabled(config.elimination?.enabled ?? eliminationEnabled);
    setEditableEliminationCounterId(
      config.elimination?.counterId ?? nextCounters[0]?.id ?? counterDefinitions[0]?.id ?? ''
    );
    setEditableEliminationThreshold(config.elimination?.threshold ?? eliminationThreshold);
  };

  const handleApplySettings = () => {
    if (!canSaveCounters) {
      setConfigMessage('Every counter requires both an id and a name.');
      return;
    }

    let parsedOverrides: PlayerOverride[];
    try {
      const parsed = JSON.parse(overridesText) as PlayerOverride[];
      if (!Array.isArray(parsed)) {
        throw new Error('Overrides must be an array.');
      }
      parsedOverrides = parsed;
    } catch (error) {
      console.error(error);
      setConfigMessage('Invalid overrides JSON. Expected an array of player override objects.');
      return;
    }

    const countersChanged = JSON.stringify(editableCounters) !== JSON.stringify(counterDefinitions);
    const recalculateFromInitialValues = countersChanged
      ? window.confirm(
          'Recalculate current and historical totals based on changes to counter starting values?\n\n' +
          'OK: Recalculate totals\nCancel: Keep existing totals as-is'
        )
      : false;

    setCounterDefinitions(editableCounters, { recalculateFromInitialValues });
    setCurrentGameConfigName(configName);
    setDefaultPlayerCount(Math.max(1, Number(editableDefaultPlayerCount || 1)));
    setPlayerOverrides(parsedOverrides);
    setEliminationConfig({
      enabled: editableEliminationEnabled,
      counterId: editableEliminationCounterId,
      threshold: Number(editableEliminationThreshold || 0),
    });
    navigate(-1);
  };

  const handleImportConfig = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const config = parseGameConfig(content, file.name);
      applyConfigToDraft(config);
      setConfigMessage(`Imported config into draft: ${config.name ?? file.name}`);
    } catch (error) {
      console.error(error);
      setConfigMessage('Failed to import config. Check JSON/YAML format.');
    } finally {
      event.target.value = '';
    }
  };

  const handleExportConfig = () => {
    const payload: GameConfig = {
      name: configName || currentGameConfigName,
      counters: editableCounters.map((counter) => ({
        id: counter.id,
        name: counter.name,
        icon: counter.icon,
        initialValue: counter.initialValue,
        persistsBetweenTurns: counter.persistsBetweenTurns,
        alwaysDisplayed: counter.alwaysDisplayed,
      })),
      players: {
        defaultPlayerCount: editableDefaultPlayerCount,
        overrides: (() => {
          try {
            const parsed = JSON.parse(overridesText) as PlayerOverride[];
            return Array.isArray(parsed) ? parsed : playerOverrides;
          } catch {
            return playerOverrides;
          }
        })(),
      },
      elimination: {
        enabled: editableEliminationEnabled,
        counterId: editableEliminationCounterId,
        threshold: editableEliminationThreshold,
      },
    };

    const blob = new Blob([stringifyGameConfigYaml(payload)], { type: 'application/x-yaml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (payload.name || 'game-config').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.href = url;
    link.download = `${safeName || 'game-config'}.yaml`;
    link.click();
    URL.revokeObjectURL(url);
    setConfigMessage(`Exported ${safeName || 'game-config'}.yaml`);
  };

  return (
    <div className="page-shell">
      <div className="page-wrap settings-grid">
        <div className="header-row">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <h1 className="header-title">Settings</h1>
          <button className="btn" onClick={handleApplySettings} disabled={!canSaveCounters}>
            Apply
          </button>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Theme</h2>
          <div className="controls-row" style={{ justifyContent: 'flex-start' }}>
            <span>Theme: {theme === 'generic' ? 'Generic' : 'Star Realms'}</span>
            <button className="btn" onClick={toggleTheme}>
              Switch Theme
            </button>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Game Config Name</h2>
          <div className="controls-row" style={{ justifyContent: 'flex-start' }}>
            <input
              type="text"
              className="input"
              value={configName}
              onChange={(event) => setConfigName(event.target.value)}
              placeholder="Config name"
              style={{ width: '100%', boxSizing: 'border-box', maxWidth: '360px' }}
            />
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Counter Definitions</h2>
          <p style={{ opacity: 0.75, marginBottom: '12px' }}>
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

          <div className="controls-row" style={{ justifyContent: 'flex-start', marginTop: '12px' }}>
            <button
              className="btn btn-secondary"
              onClick={() => setEditableCounters([...editableCounters, createNewCounter(editableCounters.length)])}
            >
              Add Counter
            </button>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Player Defaults & Overrides</h2>
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

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Elimination / Win Condition</h2>
          <p style={{ opacity: 0.75, marginBottom: '12px' }}>
            When enabled, players with monitored counter value below threshold are skipped in turn order.
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
              <label>Minimum Value (alive if &gt;= threshold)</label>
              <input
                type="number"
                className="input"
                value={editableEliminationThreshold}
                onChange={(event) => setEditableEliminationThreshold(Number(event.target.value || 0))}
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginTop: 0 }}>Players (Live Session)</h2>
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
                      onChange={(event) =>
                        setEditingPlayerNames({
                          ...editingPlayerNames,
                          [player.id]: event.target.value,
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
              onChange={(event) => setNewPlayerName(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
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
            Bundled presets are loaded from YAML files in public/configs.
          </p>
          <div className="controls-row" style={{ justifyContent: 'flex-start' }}>
            {bundledConfigs.map((config) => (
              <button
                key={config.name ?? JSON.stringify(config)}
                className="btn btn-secondary"
                onClick={() => {
                  applyConfigToDraft(config);
                  setConfigMessage(`Loaded bundled config into draft: ${config.name ?? 'Unnamed config'}`);
                }}
              >
                {config.name ?? 'Unnamed config'}
              </button>
            ))}
          </div>
        </div>

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
                onChange={handleImportConfig}
                style={{ display: 'none' }}
              />
            </label>
            <button className="btn btn-secondary" onClick={handleExportConfig}>
              Export YAML
            </button>
          </div>
          {configMessage && <p style={{ marginTop: '10px', opacity: 0.8 }}>{configMessage}</p>}
        </div>
      </div>
    </div>
  );
};
