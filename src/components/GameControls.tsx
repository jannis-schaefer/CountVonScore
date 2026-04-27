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
    <div className="controls-row p-8">
      <button
        className={`btn btn-secondary btn-min-100 ${!hasHistory ? 'btn-disabled' : ''}`}
        onClick={onUndo}
        disabled={!hasHistory}
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
          <button className="btn btn-danger btn-min-100" onClick={handleResetClick}>
            Reset
          </button>
          <button className="btn btn-secondary btn-min-100" onClick={onOpenSettings}>
            Settings
          </button>
        </>
      )}
    </div>
  );
};
