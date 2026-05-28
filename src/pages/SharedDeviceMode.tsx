import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { evaluatePlayerEliminationStatus } from '../store/engine/elimination';
import { PlayerCard } from '../components/PlayerCard';
import { PlayerCardsLayout } from '../components/PlayerCardsLayout';
import { TurnNavigation } from '../components/TurnNavigation';
import { GameControls } from '../components/GameControls';
import { usePlayerCardLayout } from '../context/usePlayerCardLayout';

export const SharedDeviceMode: React.FC = () => {
  const navigate = useNavigate();
  const { layoutId, autoFocusEnabled } = usePlayerCardLayout();
  const {
    players,
    viewedPlayers,
    viewedTurnNumber,
    isHistoricalTurnDirty,
    turnRecords,
    currentPlayerIndex,
    turnNumber,
    history,
    counterDefinitions,
    eliminationEnabled,
    eliminationCounterId,
    eliminationThreshold,
    eliminationOutcome,
    eliminationRule,
    setCounter,
    setStartingPlayer,
    nextTurn,
    previousTurn,
    applyHistoricalChanges,
    continueFromHistoricalTurn,
    resetGame,
    undo,
  } = useGameStore();

  // Show starting-player overlay when we're at the very first turn and no player has been chosen yet.
  const [hasSelectedStartingPlayer, setHasSelectedStartingPlayer] = useState(turnNumber > 1);
  const [selectingManually, setSelectingManually] = useState(false);
  const startingPlayerChosen = turnNumber > 1 || hasSelectedStartingPlayer;

  const handleChoosePlayer = (index: number) => {
    setStartingPlayer(index);
    setHasSelectedStartingPlayer(true);
    setSelectingManually(false);
  };

  const handleChooseRandom = () => {
    const randomIndex = Math.floor(Math.random() * players.length);
    handleChoosePlayer(randomIndex);
  };

  const displayedPlayers = viewedPlayers ?? players;
  const isViewingHistoricalTurn = viewedTurnNumber !== null;
  const viewedTurnRecord = viewedTurnNumber !== null ? turnRecords[viewedTurnNumber - 1] : undefined;
  const displayedPlayerIndex = viewedTurnNumber !== null && displayedPlayers.length > 0
    ? Math.max(0, displayedPlayers.findIndex((player) => player.id === viewedTurnRecord?.actingPlayerId))
    : currentPlayerIndex;
  const currentPlayer = displayedPlayers[displayedPlayerIndex];
  const canNavigatePrevious = isViewingHistoricalTurn ? viewedTurnNumber! > 1 && !isHistoricalTurnDirty : turnNumber > 1;
  const canNavigateNext = !isHistoricalTurnDirty;
  const nextLabel = isViewingHistoricalTurn
    ? viewedTurnNumber === turnNumber - 1
      ? 'Return to Current'
      : 'Next Turn'
    : 'End Turn';
  const hasUndoAvailable = history.length > 0 || (!isViewingHistoricalTurn && turnNumber > 1);
  const focusKey = `${viewedTurnNumber ?? turnNumber}:${displayedPlayerIndex}`;

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

        <div className="layout-main-single" style={{ position: 'relative' }}>
          {/* Starting player overlay */}
          {!startingPlayerChosen && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--primary-bg, #0d1b2a)',
                borderRadius: '12px',
              }}
            >
              <div className="card stack" style={{ maxWidth: '420px', width: '100%', textAlign: 'center', gap: '16px' }}>
                <h2 style={{ margin: 0 }}>Who goes first?</h2>
                {selectingManually ? (
                  <>
                    <p style={{ opacity: 0.75, margin: 0 }}>Select a player:</p>
                    <div className="stack" style={{ gap: '8px' }}>
                      {players.map((player, index) => (
                        <button
                          key={player.id}
                          className="btn btn-secondary"
                          style={{ width: '100%' }}
                          onClick={() => handleChoosePlayer(index)}
                        >
                          {player.name}
                        </button>
                      ))}
                    </div>
                    <button className="btn btn-secondary" onClick={() => setSelectingManually(false)}>
                      Back
                    </button>
                  </>
                ) : (
                  <div className="stack" style={{ gap: '10px' }}>
                    <button
                      className="btn"
                      style={{ width: '100%' }}
                      onClick={() => handleChoosePlayer(0)}
                    >
                      {players[0]?.name ?? 'Player 1'}
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ width: '100%' }}
                      onClick={() => setSelectingManually(true)}
                    >
                      Select Player
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ width: '100%' }}
                      onClick={handleChooseRandom}
                    >
                      🎲 Random
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="panel">
            <TurnNavigation
              currentPlayerName={currentPlayer?.name || 'Unknown'}
              playerCount={displayedPlayers.length}
              currentPlayerIndex={displayedPlayerIndex}
              turnNumber={viewedTurnNumber ?? turnNumber}
              latestTurnNumber={turnNumber}
              isViewingHistoricalTurn={isViewingHistoricalTurn}
              previousLabel="Previous Turn"
              nextLabel={nextLabel}
              disablePrevious={!canNavigatePrevious}
              disableNext={!canNavigateNext}
              onNextPlayer={nextTurn}
              onPreviousPlayer={previousTurn}
            />
          </div>

          {isViewingHistoricalTurn && !isHistoricalTurnDirty && (
            <div className="panel" style={{ border: '1px solid rgba(255,255,255,0.12)' }}>
              <p style={{ margin: 0, opacity: 0.8 }}>
                Viewing the saved result for turn {viewedTurnNumber}. Navigate forward to review later turns or return to the current turn.
              </p>
            </div>
          )}

          {isHistoricalTurnDirty && (
            <div className="panel stack" style={{ gap: '12px', border: '1px solid rgba(255,255,255,0.18)' }}>
              <div>
                <h3 className="panel-title" style={{ marginBottom: '6px' }}>Past Turn Changed</h3>
                <p style={{ margin: 0, opacity: 0.82 }}>
                  Apply this edited turn to recalculate the later turns and return to the current turn, or discard the later turns and continue the game from this edited result.
                </p>
              </div>
              <div className="controls-row" style={{ justifyContent: 'flex-start' }}>
                <button className="btn" onClick={applyHistoricalChanges}>
                  Apply Changes and Return
                </button>
                <button className="btn btn-secondary" onClick={continueFromHistoricalTurn}>
                  Continue From This Turn
                </button>
              </div>
            </div>
          )}

          <PlayerCardsLayout
            layoutId={layoutId}
            activePlayerId={currentPlayer?.id}
            focusKey={focusKey}
            enableAutoFocus={startingPlayerChosen && autoFocusEnabled}
            items={displayedPlayers.map((player, index) => {
              const isActive = index === displayedPlayerIndex;
              const status = evaluatePlayerEliminationStatus(player, displayedPlayers, {
                enabled: eliminationEnabled,
                counterId: eliminationCounterId,
                threshold: eliminationThreshold,
                outcome: eliminationOutcome,
                rule: eliminationRule,
              });

              return {
                id: player.id,
                node: (
                  <PlayerCard
                    player={player}
                    isActive={isActive}
                    statusLabel={status.label}
                    isOutOfTurnRotation={status.isOutOfTurnRotation}
                    onCounterChange={(counterId, value) =>
                      handleCounterChange(player.id, counterId, value)
                    }
                    counterDefinitions={counterDefinitions}
                    compact={!isActive}
                  />
                ),
              };
            })}
          />

          <div className="panel">
            <GameControls
              onUndo={undo}
              onReset={() => {
                resetGame();
                setHasSelectedStartingPlayer(false);
                setSelectingManually(false);
              }}
              onOpenSettings={() => navigate('/settings')}
              hasHistory={hasUndoAvailable}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
