import { useMemo, useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { parseGameConfig, stringifyGameConfigYaml, loadBundledGameConfigs } from '../utils/gameConfig';
import type { EliminationOutcome, EliminationRule } from '../store/engine/elimination';
import type { CounterDefinition, GameConfig, PlayerOverride } from '../store/gameStore';

export interface SettingsDraft {
  // Draft state
  editableCounters: CounterDefinition[];
  setEditableCounters: React.Dispatch<React.SetStateAction<CounterDefinition[]>>;
  editableDefaultPlayerCount: number;
  setEditableDefaultPlayerCount: React.Dispatch<React.SetStateAction<number>>;
  overridesText: string;
  setOverridesText: React.Dispatch<React.SetStateAction<string>>;
  editableEliminationEnabled: boolean;
  setEditableEliminationEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  editableEliminationCounterId: string;
  setEditableEliminationCounterId: React.Dispatch<React.SetStateAction<string>>;
  editableEliminationThreshold: number;
  setEditableEliminationThreshold: React.Dispatch<React.SetStateAction<number>>;
  editableEliminationOutcome: EliminationOutcome;
  setEditableEliminationOutcome: React.Dispatch<React.SetStateAction<EliminationOutcome>>;
  editableEliminationRule: EliminationRule;
  setEditableEliminationRule: React.Dispatch<React.SetStateAction<EliminationRule>>;
  configName: string;
  setConfigName: React.Dispatch<React.SetStateAction<string>>;
  bundledConfigs: GameConfig[];
  configMessage: string;
  setConfigMessage: React.Dispatch<React.SetStateAction<string>>;
  // Derived
  canSaveCounters: boolean;
  // Actions
  applyConfigToDraft: (config: GameConfig) => void;
  commitDraft: (
    isNewGameSetup: boolean,
    recalculateFromInitialValues?: boolean
  ) => 'applied' | 'invalid' | 'needs-recalculate-confirm';
  handleImportConfig: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleExportConfig: () => void;
}

export function useSettingsDraft(): SettingsDraft {
  const {
    counterDefinitions,
    defaultPlayerCount,
    playerOverrides,
    eliminationEnabled,
    eliminationCounterId,
    eliminationThreshold,
    eliminationOutcome,
    eliminationRule,
    currentGameConfigName,
    setCounterDefinitions,
    setDefaultPlayerCount,
    setPlayerOverrides,
    setEliminationConfig,
    setCurrentGameConfigName,
  } = useGameStore();

  const [editableCounters, setEditableCounters] = useState<CounterDefinition[]>(counterDefinitions);
  const [editableDefaultPlayerCount, setEditableDefaultPlayerCount] = useState<number>(defaultPlayerCount);
  const [overridesText, setOverridesText] = useState<string>(JSON.stringify(playerOverrides, null, 2));
  const [editableEliminationEnabled, setEditableEliminationEnabled] = useState<boolean>(eliminationEnabled);
  const [editableEliminationCounterId, setEditableEliminationCounterId] = useState<string>(eliminationCounterId);
  const [editableEliminationThreshold, setEditableEliminationThreshold] = useState<number>(eliminationThreshold);
  const [editableEliminationOutcome, setEditableEliminationOutcome] = useState<EliminationOutcome>(eliminationOutcome);
  const [editableEliminationRule, setEditableEliminationRule] = useState<EliminationRule>(eliminationRule);
  const [configName, setConfigName] = useState(currentGameConfigName);
  const [bundledConfigs, setBundledConfigs] = useState<GameConfig[]>([]);
  const [configMessage, setConfigMessage] = useState('');

  useEffect(() => {
    loadBundledGameConfigs()
      .then(setBundledConfigs)
      .catch((error) => {
        console.error(error);
        setConfigMessage('Failed to load bundled game configs.');
      });
  }, []);

  const canSaveCounters = useMemo(
    () =>
      editableCounters.length > 0 &&
      editableCounters.every((counter) => counter.id.trim() && counter.name.trim()),
    [editableCounters]
  );

  const applyConfigToDraft = (config: GameConfig) => {
    const nextCounters = (config.counters ?? []).map((counter, index) => ({
      id: counter.id?.trim() || `counter-${Date.now()}-${index}`,
      name: counter.name,
      icon: counter.icon,
      initialValue: counter.initialValue,
      longPressAmount: counter.longPressAmount ?? 5,
      persistsBetweenTurns: counter.persistsBetweenTurns,
      alwaysDisplayed: counter.alwaysDisplayed,
    }));

    if (nextCounters.length > 0) {
      setEditableCounters(nextCounters);
    }

    setConfigName(config.name ?? '');
    setEditableDefaultPlayerCount(
      Math.max(1, Number(config.players?.defaultPlayerCount ?? defaultPlayerCount ?? 1))
    );
    setOverridesText(JSON.stringify(config.players?.overrides ?? [], null, 2));
    setEditableEliminationEnabled(config.elimination?.enabled ?? eliminationEnabled);
    setEditableEliminationCounterId(
      config.elimination?.counterId ?? nextCounters[0]?.id ?? counterDefinitions[0]?.id ?? ''
    );
    setEditableEliminationThreshold(config.elimination?.threshold ?? eliminationThreshold);
    setEditableEliminationOutcome(config.elimination?.outcome ?? eliminationOutcome);
    setEditableEliminationRule(config.elimination?.rule ?? eliminationRule);
  };

  const commitDraft = (
    isNewGameSetup: boolean,
    recalculateFromInitialValues?: boolean
  ): 'applied' | 'invalid' | 'needs-recalculate-confirm' => {
    if (!canSaveCounters) {
      setConfigMessage('Every counter requires both an id and a name.');
      return 'invalid';
    }

    let parsedOverrides: PlayerOverride[];
    try {
      const parsed = JSON.parse(overridesText) as PlayerOverride[];
      if (!Array.isArray(parsed)) throw new Error('Overrides must be an array.');
      parsedOverrides = parsed;
    } catch (error) {
      console.error(error);
      setConfigMessage('Invalid overrides JSON. Expected an array of player override objects.');
      return 'invalid';
    }

    const countersChanged = JSON.stringify(editableCounters) !== JSON.stringify(counterDefinitions);
    const requiresRecalculationDecision = countersChanged && !isNewGameSetup;

    if (requiresRecalculationDecision && recalculateFromInitialValues === undefined) {
      return 'needs-recalculate-confirm';
    }

    setCounterDefinitions(editableCounters, {
      recalculateFromInitialValues: Boolean(recalculateFromInitialValues),
    });
    setCurrentGameConfigName(configName);
    setDefaultPlayerCount(Math.max(1, Number(editableDefaultPlayerCount || 1)));
    setPlayerOverrides(parsedOverrides);
    setEliminationConfig({
      enabled: editableEliminationEnabled,
      counterId: editableEliminationCounterId,
      threshold: Number(editableEliminationThreshold || 0),
      outcome: editableEliminationOutcome,
      rule: editableEliminationRule,
    });

    return 'applied';
  };

  const handleImportConfig = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const content = await file.text();
      const config = parseGameConfig(content, file.name);
      applyConfigToDraft(config);
      setConfigMessage(`Imported config into draft: ${config.name ?? file.name}`);
    } catch (error) {
      console.error(error);
      setConfigMessage('Failed to import config. Check JSON/YAML format.');
    } finally {
      event.target.value = '';
    }
  };

  const handleExportConfig = () => {
    const payload: GameConfig = {
      name: configName || currentGameConfigName,
      counters: editableCounters.map((counter) => ({
        id: counter.id,
        name: counter.name,
        icon: counter.icon,
        initialValue: counter.initialValue,
        persistsBetweenTurns: counter.persistsBetweenTurns,
        alwaysDisplayed: counter.alwaysDisplayed,
      })),
      players: {
        defaultPlayerCount: editableDefaultPlayerCount,
        overrides: (() => {
          try {
            const parsed = JSON.parse(overridesText) as PlayerOverride[];
            return Array.isArray(parsed) ? parsed : playerOverrides;
          } catch {
            return playerOverrides;
          }
        })(),
      },
      elimination: {
        enabled: editableEliminationEnabled,
        counterId: editableEliminationCounterId,
        threshold: editableEliminationThreshold,
        outcome: editableEliminationOutcome,
        rule: editableEliminationRule,
      },
    };

    const blob = new Blob([stringifyGameConfigYaml(payload)], { type: 'application/x-yaml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = (payload.name || 'game-config').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.href = url;
    link.download = `${safeName || 'game-config'}.yaml`;
    link.click();
    URL.revokeObjectURL(url);
    setConfigMessage(`Exported ${safeName || 'game-config'}.yaml`);
  };

  return {
    editableCounters,
    setEditableCounters,
    editableDefaultPlayerCount,
    setEditableDefaultPlayerCount,
    overridesText,
    setOverridesText,
    editableEliminationEnabled,
    setEditableEliminationEnabled,
    editableEliminationCounterId,
    setEditableEliminationCounterId,
    editableEliminationThreshold,
    setEditableEliminationThreshold,
    editableEliminationOutcome,
    setEditableEliminationOutcome,
    editableEliminationRule,
    setEditableEliminationRule,
    configName,
    setConfigName,
    bundledConfigs,
    configMessage,
    setConfigMessage,
    canSaveCounters,
    applyConfigToDraft,
    commitDraft,
    handleImportConfig,
    handleExportConfig,
  };
}
