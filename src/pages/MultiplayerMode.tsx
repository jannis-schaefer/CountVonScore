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
    counterDefinitions,
    currentPlayerIndex,
    setCounter,
    resetGame,
    undo,
  } = useGameStore();
  const [trackedPlayerIndex, setTrackedPlayerIndex] = React.useState(0);

  useEffect(() => {
    if (players.length === 0) {
      setTrackedPlayerIndex(0);
      return;
    }

    const preferred = Math.min(currentPlayerIndex, players.length - 1);
    setTrackedPlayerIndex((prev) => {
      if (prev >= 0 && prev < players.length) {
        return prev;
      }
      return preferred;
    });
  }, [players, currentPlayerIndex]);

  const handleCounterChange = (
    playerId: string,
    counterId: string,
    value: number
  ) => {
    setCounter(playerId, counterId, value);
  };

  const trackedPlayer = players[trackedPlayerIndex];

  return (
    <div className="page-shell">
      <div className="page-wrap stack">
        <div className="header-row">
          <button className="btn btn-secondary" onClick={() => navigate('/')}>
            Back
          </button>
          <h1 className="header-title">Personal Device (One Player)</h1>
          <button className="btn btn-secondary" onClick={() => navigate('/settings')}>
            Settings
          </button>
        </div>

        <div className="panel">
          <h3 className="panel-title">Tracked Player</h3>
          <p style={{ opacity: 0.75, margin: 0 }}>
            This device tracks one player only. Switch which player this device is tracking here.
          </p>
          <div className="controls-row" style={{ justifyContent: 'flex-start', marginTop: '10px' }}>
            <label htmlFor="tracked-player">Player</label>
            <select
              id="tracked-player"
              className="input"
              value={trackedPlayerIndex}
              onChange={(event) => setTrackedPlayerIndex(Number(event.target.value))}
              style={{ maxWidth: '240px' }}
            >
              {players.map((player, index) => (
                <option key={player.id} value={index}>
                  {player.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="layout-main-single">
          <div>
            {trackedPlayer ? (
              <PlayerCard
                player={trackedPlayer}
                isActive={true}
                onCounterChange={(counterId, value) =>
                  handleCounterChange(trackedPlayer.id, counterId, value)
                }
                counterDefinitions={counterDefinitions}
                compact={false}
              />
            ) : null}
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
