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
      <div style={{ fontSize: '0.85rem', opacity: 0.65, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Turn {turnNumber}
        {isViewingHistoricalTurn ? ` of ${latestTurnNumber - 1}` : ''}
      </div>
      <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>
        {isViewingHistoricalTurn ? `${currentPlayerName}'s Result` : `${currentPlayerName}'s Turn`}
      </div>
      <div className="turn-nav-meta">
        Player {currentPlayerIndex + 1} of {playerCount}
        {isViewingHistoricalTurn ? ' • Saved turn result' : ''}
      </div>
      <div className="turn-nav-actions">
        <button
          className="btn btn-secondary"
          onClick={onPreviousPlayer}
          disabled={disablePrevious}
          style={{ minWidth: '120px', opacity: disablePrevious ? 0.5 : 1, cursor: disablePrevious ? 'not-allowed' : 'pointer' }}
        >
          {previousLabel}
        </button>
        <button
          className="btn"
          onClick={onNextPlayer}
          disabled={disableNext}
          style={{ minWidth: '120px', opacity: disableNext ? 0.5 : 1, cursor: disableNext ? 'not-allowed' : 'pointer' }}
        >
          {nextLabel}
        </button>
      </div>
    </div>
  );
};
