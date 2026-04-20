import React, { useState } from 'react';

interface GameControlsProps {
  onUndo: () => void;
  onReset: () => void;
  onOpenSettings: () => void;
  hasHistory: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onUndo,
  onReset,
  onOpenSettings,
  hasHistory,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleConfirmReset = () => {
    onReset();
    setShowResetConfirm(false);
  };

  return (
    <div className="controls-row" style={{ padding: '8px' }}>
      <button
        className="btn btn-secondary"
        onClick={onUndo}
        disabled={!hasHistory}
        style={{ minWidth: '100px', opacity: hasHistory ? 1 : 0.5, cursor: hasHistory ? 'pointer' : 'not-allowed' }}
      >
        Undo
      </button>

      {showResetConfirm ? (
        <>
          <div className="controls-row">
            <button className="btn btn-danger" onClick={handleConfirmReset}>
              Confirm Reset
            </button>
            <button className="btn btn-secondary" onClick={() => setShowResetConfirm(false)}>
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <button className="btn btn-danger" onClick={handleResetClick} style={{ minWidth: '100px' }}>
            Reset
          </button>
          <button className="btn btn-secondary" onClick={onOpenSettings} style={{ minWidth: '100px' }}>
            Settings
          </button>
        </>
      )}
    </div>
  );
};
