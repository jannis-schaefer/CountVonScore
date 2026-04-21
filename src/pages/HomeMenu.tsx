import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';

export const HomeMenu: React.FC = () => {
  const navigate = useNavigate();
  const { hasSavedGame, gameMode } = useGameStore();

  const handleResume = () => {
    if (!hasSavedGame) {
      return;
    }

    navigate(gameMode === 'multiplayer' ? '/multiplayer' : '/shared');
  };

  return (
    <div className="page-center">
      <div className="page-wrap stack" style={{ maxWidth: '760px' }}>
        <div className="stack" style={{ textAlign: 'center', gap: '8px' }}>
          <h1 className="header-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
            Card Game Counter
          </h1>
          <p style={{ opacity: 0.85, maxWidth: '620px', margin: '0 auto' }}>
            Choose whether this device tracks the full table or just one player.
          </p>
        </div>

        <div className="mode-grid">
          <div className="card mode-card">
            <h2 style={{ marginBottom: '10px' }}>Resume Saved Game</h2>
            <p style={{ marginBottom: '16px', opacity: 0.85 }}>
              Continue where you left off.
            </p>
            <button
              className="btn"
              onClick={handleResume}
              style={{ width: '100%' }}
              disabled={!hasSavedGame}
            >
              Resume
            </button>
          </div>

          <div className="card mode-card">
            <h2 style={{ marginBottom: '10px' }}>Start New Game</h2>
            <p style={{ marginBottom: '16px', opacity: 0.85 }}>
              Pick mode, player count, and optional preset before confirming.
            </p>
            <button className="btn" onClick={() => navigate('/new-game')} style={{ width: '100%' }}>
              New Game
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="controls-row" style={{ justifyContent: 'flex-start' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/settings')}>
              Edit Game Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
