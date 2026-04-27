import React, { useState } from 'react';
import type { Player } from '../../store/gameStore';

interface Props {
  players: Player[];
  addPlayer: (name: string) => void;
  removePlayer: (id: string) => void;
  updatePlayerName: (id: string, name: string) => void;
}

export const PlayersLiveSection: React.FC<Props> = ({
  players,
  addPlayer,
  removePlayer,
  updatePlayerName,
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [editingPlayerIds, setEditingPlayerIds] = useState<Set<string>>(new Set());
  const [editingPlayerNames, setEditingPlayerNames] = useState<Record<string, string>>({});

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

  return (
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
                    setEditingPlayerNames({ ...editingPlayerNames, [player.id]: event.target.value })
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
              onClick={() => { if (players.length > 1) removePlayer(player.id); }}
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
          onKeyDown={(event) => { if (event.key === 'Enter') handleAddPlayer(); }}
          style={{ flex: 1 }}
        />
        <button className="btn" onClick={handleAddPlayer} disabled={!newPlayerName.trim()}>
          Add Player
        </button>
      </div>
    </div>
  );
};
