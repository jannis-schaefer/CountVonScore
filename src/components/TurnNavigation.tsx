import React from 'react';

interface TurnNavigationProps {
  currentPlayerName: string;
  playerCount: number;
  currentPlayerIndex: number;
  onNextPlayer: () => void;
  onPreviousPlayer: () => void;
}

export const TurnNavigation: React.FC<TurnNavigationProps> = ({
  currentPlayerName,
  playerCount,
  currentPlayerIndex,
  onNextPlayer,
  onPreviousPlayer,
}) => {
  return (
    <div className="turn-nav">
      <div style={{ fontSize: '1.25rem', fontWeight: '600' }}>{currentPlayerName}'s Turn</div>
      <div className="turn-nav-meta">
        Player {currentPlayerIndex + 1} of {playerCount}
      </div>
      <div className="turn-nav-actions">
        <button className="btn btn-secondary" onClick={onPreviousPlayer} style={{ minWidth: '120px' }}>
          Previous
        </button>
        <button className="btn" onClick={onNextPlayer} style={{ minWidth: '120px' }}>
          End Turn
        </button>
      </div>
    </div>
  );
};
