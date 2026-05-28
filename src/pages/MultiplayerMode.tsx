import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { evaluatePlayerEliminationStatus } from '../store/engine/elimination';
import { PlayerCard } from '../components/PlayerCard';
import { GameControls } from '../components/GameControls';

export const MultiplayerMode: React.FC = () => {
  const navigate = useNavigate();
  const {
    players,
    history,
    counterDefinitions,
    currentPlayerIndex,
    eliminationEnabled,
    eliminationCounterId,
    eliminationThreshold,
    eliminationOutcome,
    eliminationRule,
    setCounter,
    resetGame,
    undo,
  } = useGameStore();
  const [trackedPlayerIndex, setTrackedPlayerIndex] = React.useState(0);
  const preferredTrackedPlayerIndex = players.length === 0
    ? 0
    : Math.min(currentPlayerIndex, players.length - 1);
  const safeTrackedPlayerIndex = trackedPlayerIndex >= 0 && trackedPlayerIndex < players.length
    ? trackedPlayerIndex
    : preferredTrackedPlayerIndex;

  const handleCounterChange = (
    playerId: string,
    counterId: string,
    value: number
  ) => {
    setCounter(playerId, counterId, value);
  };

  const trackedPlayer = players[safeTrackedPlayerIndex];
  const trackedPlayerStatus = trackedPlayer
    ? evaluatePlayerEliminationStatus(trackedPlayer, players, {
        enabled: eliminationEnabled,
        counterId: eliminationCounterId,
        threshold: eliminationThreshold,
        outcome: eliminationOutcome,
        rule: eliminationRule,
      })
    : null;

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
          <p className="text-muted-soft mb-0">
            This device tracks one player only. Switch which player this device is tracking here.
          </p>
          <div className="controls-row controls-start mt-10">
            <label htmlFor="tracked-player">Player</label>
            <select
              id="tracked-player"
              className="input w-fit-240"
              value={safeTrackedPlayerIndex}
              onChange={(event) => setTrackedPlayerIndex(Number(event.target.value))}
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
                statusLabel={trackedPlayerStatus?.label}
                isOutOfTurnRotation={trackedPlayerStatus?.isOutOfTurnRotation}
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
