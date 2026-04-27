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
      <h2 className="mt-0">Players (Live Session)</h2>
      <div className="mb-20">
        {players.map((player) => (
          <div key={player.id} className="player-live-row">
            {editingPlayerIds.has(player.id) ? (
              <>
                <input
                  type="text"
                  className="input flex-1"
                  value={editingPlayerNames[player.id] || ''}
                  onChange={(event) =>
                    setEditingPlayerNames({ ...editingPlayerNames, [player.id]: event.target.value })
                  }
                />
                <button className="btn" onClick={() => handleSavePlayerName(player.id)}>
                  Save
                </button>
              </>
            ) : (
              <>
                <span className="flex-1">{player.name}</span>
                <button
                  className="btn btn-secondary"
                  onClick={() => handleStartEditPlayer(player.id, player.name)}
                >
                  Edit
                </button>
              </>
            )}
            <button
              className={`btn btn-danger ${players.length === 1 ? 'btn-disabled' : ''}`}
              onClick={() => { if (players.length > 1) removePlayer(player.id); }}
              disabled={players.length === 1}
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="row-tight">
        <input
          type="text"
          className="input flex-1"
          placeholder="New player name"
          value={newPlayerName}
          onChange={(event) => setNewPlayerName(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') handleAddPlayer(); }}
        />
        <button className="btn" onClick={handleAddPlayer} disabled={!newPlayerName.trim()}>
          Add Player
        </button>
      </div>
    </div>
  );
};
