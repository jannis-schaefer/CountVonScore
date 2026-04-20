import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { PlayerCard } from '../components/PlayerCard';
import { GameControls } from '../components/GameControls';

export const MultiplayerMode: React.FC = () => {
  const navigate = useNavigate();
  const {
    players,
    history,
    counterNames,
    counterVisibleForNonActive,
    currentPlayerIndex,
    setCurrentPlayer,
    setCounter,
    resetGame,
    undo,
    loadGame,
  } = useGameStore();

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  const handleCounterChange = (
    playerId: string,
    counter: keyof (typeof players[0]['counters']),
    value: number
  ) => {
    setCounter(playerId, counter, value);
  };

  return (
    <div className="page-shell">
      <div className="page-wrap stack">
        <div className="header-row">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Back
          </button>
          <h1 className="header-title">Multiplayer Mode</h1>
          <button className="btn btn-secondary" onClick={() => navigate('/settings')}>
            Settings
          </button>
        </div>

        <div className="panel">
          <h3 className="panel-title">Tabletop Layout</h3>
          <p style={{ opacity: 0.75, margin: 0 }}>
            Tap a player card to mark active turn. Non-active cards show configured counters for fast attack/life updates.
          </p>
        </div>

        <div className="layout-main-single">
          <div className="tabletop-grid tabletop-grid-landscape">
            {players.map((player, index) => {
              const isActive = index === currentPlayerIndex;
              return (
                <button
                  key={player.id}
                  className="card-button"
                  type="button"
                  onClick={() => setCurrentPlayer(index)}
                >
                  <PlayerCard
                    player={player}
                    isActive={isActive}
                    onCounterChange={(counter, value) => handleCounterChange(player.id, counter, value)}
                    counterNames={counterNames}
                    visibleCounters={isActive ? { authority: true, money: true, attack: true } : counterVisibleForNonActive}
                    compact={!isActive}
                  />
                </button>
              );
            })}
          </div>

          <div className="panel">
            <GameControls
              onUndo={undo}
              onReset={resetGame}
              onOpenSettings={() => navigate('/settings')}
              hasHistory={history.length > 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
