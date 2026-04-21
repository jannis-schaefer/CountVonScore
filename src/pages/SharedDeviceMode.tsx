import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { PlayerCard } from '../components/PlayerCard';
import { TurnNavigation } from '../components/TurnNavigation';
import { GameControls } from '../components/GameControls';

export const SharedDeviceMode: React.FC = () => {
  const navigate = useNavigate();
  const {
    players,
    currentPlayerIndex,
    history,
    counterDefinitions,
    setCounter,
    setCurrentPlayer,
    nextPlayer,
    previousPlayer,
    resetGame,
    undo,
    loadGame,
  } = useGameStore();

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  const currentPlayer = players[currentPlayerIndex];

  const handleCounterChange = (
    playerId: string,
    counterId: string,
    value: number
  ) => {
    setCounter(playerId, counterId, value);
  };

  return (
    <div className="page-shell">
      <div className="page-wrap stack">
        <div className="header-row">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Back
          </button>
          <h1 className="header-title">Shared Device (All Players)</h1>
          <button className="btn btn-secondary" onClick={() => navigate('/settings')}>
            Settings
          </button>
        </div>

        <div className="layout-main-single">
          <div className="panel">
            <TurnNavigation
              currentPlayerName={currentPlayer?.name || 'Unknown'}
              playerCount={players.length}
              currentPlayerIndex={currentPlayerIndex}
              onNextPlayer={nextPlayer}
              onPreviousPlayer={previousPlayer}
            />
          </div>

          <div className="tabletop-grid">
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
                    onCounterChange={(counterId, value) =>
                      handleCounterChange(player.id, counterId, value)
                    }
                    counterDefinitions={counterDefinitions}
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
