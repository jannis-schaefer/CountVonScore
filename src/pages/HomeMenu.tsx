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
      <div className="page-wrap stack max-w-760">
        <div className="stack stack-tight text-center">
          <h1 className="header-title hero-title">
            Card Game Counter
          </h1>
          <p className="text-muted max-w-620 mx-auto">
            Choose whether this device tracks the full table or just one player.
          </p>
        </div>

        <div className="mode-grid">
          <div className="card mode-card">
            <h2 className="mb-10">Resume Saved Game</h2>
            <p className="mb-16 text-muted">
              Continue where you left off.
            </p>
            <button
              className="btn w-full"
              onClick={handleResume}
              disabled={!hasSavedGame}
            >
              Resume
            </button>
          </div>

          <div className="card mode-card">
            <h2 className="mb-10">Start New Game</h2>
            <p className="mb-16 text-muted">
              Pick mode, player count, and optional preset before confirming.
            </p>
            <button className="btn w-full" onClick={() => navigate('/new-game')}>
              New Game
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="controls-row controls-start">
            <button className="btn btn-secondary" onClick={() => navigate('/settings')}>
              Edit Game Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
