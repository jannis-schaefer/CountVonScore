import React from 'react';

interface TurnNavigationProps {
  currentPlayerName: string;
  playerCount: number;
  currentPlayerIndex: number;
  turnNumber: number;
  latestTurnNumber: number;
  isViewingHistoricalTurn?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  disablePrevious?: boolean;
  disableNext?: boolean;
  onNextPlayer: () => void;
  onPreviousPlayer: () => void;
}

export const TurnNavigation: React.FC<TurnNavigationProps> = ({
  currentPlayerName,
  playerCount,
  currentPlayerIndex,
  turnNumber,
  latestTurnNumber,
  isViewingHistoricalTurn = false,
  previousLabel = 'Previous',
  nextLabel = 'End Turn',
  disablePrevious = false,
  disableNext = false,
  onNextPlayer,
  onPreviousPlayer,
}) => {
  return (
    <div className="turn-nav">
      <div className="turn-nav-label">
        Turn {turnNumber}
        {isViewingHistoricalTurn ? ` of ${latestTurnNumber - 1}` : ''}
      </div>
      <div className="turn-nav-title">
        {isViewingHistoricalTurn ? `${currentPlayerName}'s Result` : `${currentPlayerName}'s Turn`}
      </div>
      <div className="turn-nav-meta">
        Player {currentPlayerIndex + 1} of {playerCount}
        {isViewingHistoricalTurn ? ' • Saved turn result' : ''}
      </div>
      <div className="turn-nav-actions">
        <button
          className={`btn btn-secondary btn-min-120 ${disablePrevious ? 'btn-disabled' : ''}`}
          onClick={onPreviousPlayer}
          disabled={disablePrevious}
        >
          {previousLabel}
        </button>
        <button
          className={`btn btn-min-120 ${disableNext ? 'btn-disabled' : ''}`}
          onClick={onNextPlayer}
          disabled={disableNext}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
};
