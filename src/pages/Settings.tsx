import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useTheme } from '../context/ThemeContext';
import { useSettingsDraft } from '../hooks/useSettingsDraft';
import { CounterDefinitionsSection } from '../components/settings/CounterDefinitionsSection';
import { EliminationSection } from '../components/settings/EliminationSection';
import { PlayerDefaultsSection } from '../components/settings/PlayerDefaultsSection';
import { PlayersLiveSection } from '../components/settings/PlayersLiveSection';
import { BundledPresetsSection } from '../components/settings/BundledPresetsSection';
import { ImportExportSection } from '../components/settings/ImportExportSection';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { players, addPlayer, removePlayer, updatePlayerName } = useGameStore();
  const { theme, selectTheme, availableThemes } = useTheme();
  const draft = useSettingsDraft();
  const [showRecalculateDialog, setShowRecalculateDialog] = React.useState(false);

  const isNewGameSetup =
    typeof (location.state as { context?: unknown } | null)?.context === 'string' &&
    (location.state as { context?: string }).context === 'new-game-setup';

  const handleApplySettings = () => {
    const result = draft.commitDraft(isNewGameSetup);
    if (result === 'applied') {
      navigate(-1);
      return;
    }

    if (result === 'needs-recalculate-confirm') {
      setShowRecalculateDialog(true);
    }
  };

  const handleRecalculateChoice = (recalculateFromInitialValues: boolean) => {
    const result = draft.commitDraft(isNewGameSetup, recalculateFromInitialValues);
    setShowRecalculateDialog(false);
    if (result === 'applied') {
      navigate(-1);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-wrap settings-grid">
        <div className="header-row">
          <button className="btn btn-secondary" onClick={() => navigate(-1)}>
            Cancel
          </button>
          <h1 className="header-title">Settings</h1>
          <button className="btn" onClick={handleApplySettings} disabled={!draft.canSaveCounters}>
            Apply
          </button>
        </div>

        <div className="card">
          <h2 className="mt-0">Theme</h2>
          <div className="controls-row controls-start">
            <select
              className="input"
              value={theme}
              onChange={(e) => selectTheme(e.target.value)}
            >
              {availableThemes.map((themeOption) => (
                <option key={themeOption.id} value={themeOption.id}>
                  {themeOption.label}
                  {themeOption.description ? ` – ${themeOption.description}` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="card">
          <h2 className="mt-0">Game Config Name</h2>
          <div className="controls-row controls-start">
            <input
              type="text"
              className="input w-fit-360"
              value={draft.configName}
              onChange={(event) => draft.setConfigName(event.target.value)}
              placeholder="Config name"
            />
          </div>
        </div>

        <CounterDefinitionsSection
          editableCounters={draft.editableCounters}
          setEditableCounters={draft.setEditableCounters}
          setConfigMessage={draft.setConfigMessage}
        />

        <PlayerDefaultsSection
          editableDefaultPlayerCount={draft.editableDefaultPlayerCount}
          setEditableDefaultPlayerCount={draft.setEditableDefaultPlayerCount}
          overridesText={draft.overridesText}
          setOverridesText={draft.setOverridesText}
        />

        <EliminationSection
          editableEliminationEnabled={draft.editableEliminationEnabled}
          setEditableEliminationEnabled={draft.setEditableEliminationEnabled}
          editableEliminationCounterId={draft.editableEliminationCounterId}
          setEditableEliminationCounterId={draft.setEditableEliminationCounterId}
          editableEliminationThreshold={draft.editableEliminationThreshold}
          setEditableEliminationThreshold={draft.setEditableEliminationThreshold}
          editableEliminationOutcome={draft.editableEliminationOutcome}
          setEditableEliminationOutcome={draft.setEditableEliminationOutcome}
          editableEliminationRule={draft.editableEliminationRule}
          setEditableEliminationRule={draft.setEditableEliminationRule}
          editableCounters={draft.editableCounters}
        />

        <PlayersLiveSection
          players={players}
          addPlayer={addPlayer}
          removePlayer={removePlayer}
          updatePlayerName={updatePlayerName}
        />

        <BundledPresetsSection
          bundledConfigs={draft.bundledConfigs}
          onSelectConfig={draft.applyConfigToDraft}
          setConfigMessage={draft.setConfigMessage}
        />

        <ImportExportSection
          onImport={draft.handleImportConfig}
          onExport={draft.handleExportConfig}
          configMessage={draft.configMessage}
        />

        <ConfirmDialog
          open={showRecalculateDialog}
          title="Recalculate Totals?"
          message={
            'Counter starting values changed.\n\n' +
            'Recalculate current and historical totals from those starting values, or keep existing totals as they are?'
          }
          confirmLabel="Recalculate Totals"
          cancelLabel="Keep Existing Totals"
          onConfirm={() => handleRecalculateChoice(true)}
          onCancel={() => handleRecalculateChoice(false)}
        />
      </div>
    </div>
  );
};
