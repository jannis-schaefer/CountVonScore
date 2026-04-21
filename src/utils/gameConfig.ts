import { load as loadYaml } from 'js-yaml';
import type { GameConfig } from '../store/gameStore';

interface BundledGameConfigEntry {
  name: string;
  file: string;
}

interface BundledGameConfigManifest {
  configs: BundledGameConfigEntry[];
}

export const parseGameConfig = (raw: string, fileName?: string): GameConfig => {
  const normalizedName = (fileName ?? '').toLowerCase();
  const isYaml = normalizedName.endsWith('.yaml') || normalizedName.endsWith('.yml');

  const parsed = isYaml ? loadYaml(raw) : JSON.parse(raw);

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid config format. Expected an object.');
  }

  const config = parsed as GameConfig;

  if (!Array.isArray(config.counters) || config.counters.length === 0) {
    throw new Error('Invalid config: "counters" must be a non-empty array.');
  }

  const normalizedCounters = config.counters.map((counter, index) => {
    if (!counter.name) {
      throw new Error(`Invalid config: counter at index ${index} is missing "name".`);
    }

    if (typeof counter.initialValue !== 'number') {
      throw new Error(`Invalid config: counter "${counter.name}" is missing numeric "initialValue".`);
    }

    return {
      ...counter,
      id: counter.id ?? `${counter.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `counter-${index + 1}`}`,
      persistsBetweenTurns: Boolean(counter.persistsBetweenTurns),
      alwaysDisplayed: Boolean(counter.alwaysDisplayed),
    };
  });

  return {
    ...config,
    counters: normalizedCounters,
    players: config.players
      ? {
          defaultPlayerCount: config.players.defaultPlayerCount,
          overrides: config.players.overrides ?? [],
        }
      : undefined,
  };
};

export const stringifyGameConfigJson = (config: GameConfig): string => {
  return JSON.stringify(config, null, 2);
};

const getConfigUrl = (fileName: string): string => {
  return `${import.meta.env.BASE_URL}configs/${fileName}`;
};

export const loadBundledGameConfigs = async (): Promise<GameConfig[]> => {
  const manifestResponse = await fetch(getConfigUrl('index.yaml'));
  if (!manifestResponse.ok) {
    throw new Error('Failed to load bundled game config manifest.');
  }

  const manifestRaw = await manifestResponse.text();
  const manifest = loadYaml(manifestRaw) as BundledGameConfigManifest;
  const entries = manifest.configs ?? [];

  const configs = await Promise.all(
    entries.map(async (entry) => {
      const response = await fetch(getConfigUrl(entry.file));
      if (!response.ok) {
        throw new Error(`Failed to load config file: ${entry.file}`);
      }

      const raw = await response.text();
      const parsed = parseGameConfig(raw, entry.file);

      return {
        ...parsed,
        name: parsed.name ?? entry.name,
      };
    })
  );

  return configs;
};
