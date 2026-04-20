import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export const ModeSelection: React.FC = () => {
  const navigate = useNavigate();
  const { setGameMode } = useGameStore();

  const handleSharedMode = () => {
    setGameMode('shared');
    navigate('/shared');
  };

  const handleMultiplayerMode = () => {
    setGameMode('multiplayer');
    navigate('/multiplayer');
  };

  return (
    <div className="page-center">
      <div className="page-wrap stack" style={{ maxWidth: '900px' }}>
        <div className="stack" style={{ textAlign: 'center', gap: '8px' }}>
          <h1 className="header-title" style={{ fontSize: 'clamp(2rem, 4vw, 3.25rem)' }}>
            Multiplayer Counter
          </h1>
          <p style={{ opacity: 0.85, maxWidth: '640px', margin: '0 auto' }}>
            Track up to three resources for multiple players. Use shared mode for pass-and-play,
            or multiplayer mode to focus one player at a time.
          </p>
        </div>

        <div className="mode-grid">
          <div className="card mode-card" onClick={handleSharedMode}>
            <h2 style={{ marginBottom: '10px' }}>Shared Device</h2>
            <p style={{ marginBottom: '16px', opacity: 0.85 }}>
              One screen, turn-based flow. Great at the table with a single phone or tablet.
            </p>
            <button className="btn" onClick={handleSharedMode} style={{ width: '100%' }}>
              Start Shared Game
            </button>
          </div>

          <div className="card mode-card" onClick={handleMultiplayerMode}>
            <h2 style={{ marginBottom: '10px' }}>Multiplayer View</h2>
            <p style={{ marginBottom: '16px', opacity: 0.85 }}>
              Switch between players quickly and compare all counters in one place.
            </p>
            <button className="btn" onClick={handleMultiplayerMode} style={{ width: '100%' }}>
              Start Multiplayer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
