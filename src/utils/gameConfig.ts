import { parseDocument } from 'yaml';
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

  const parseRaw = (): unknown => {
    if (isYaml) {
      return parseDocument(raw, { version: '1.1' }).toJSON();
    }

    try {
      return JSON.parse(raw);
    } catch {
      // Fallback for files without extension or mislabeled content.
      return parseDocument(raw, { version: '1.1' }).toJSON();
    }
  };

  const parseBooleanLike = (value: unknown, fieldName: string, counterName: string): boolean => {
    if (typeof value === 'boolean') {
      return value;
    }

    if (typeof value === 'number') {
      if (value === 1) return true;
      if (value === 0) return false;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (['true', 'yes', 'y', 'on', '1'].includes(normalized)) return true;
      if (['false', 'no', 'n', 'off', '0'].includes(normalized)) return false;
    }

    throw new Error(
      `Invalid config: counter "${counterName}" field "${fieldName}" must be a boolean-like value.`
    );
  };

  const parseNumberLike = (value: unknown, fieldName: string, counterName: string): number => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    throw new Error(`Invalid config: counter "${counterName}" field "${fieldName}" must be numeric.`);
  };

  const parsed = parseRaw();

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

    const counterName = counter.name;

    return {
      ...counter,
      id: counter.id ?? `${counter.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `counter-${index + 1}`}`,
      initialValue: parseNumberLike(counter.initialValue, 'initialValue', counterName),
      persistsBetweenTurns: parseBooleanLike(counter.persistsBetweenTurns, 'persistsBetweenTurns', counterName),
      alwaysDisplayed: parseBooleanLike(counter.alwaysDisplayed, 'alwaysDisplayed', counterName),
    };
  });

  const normalizedDefaultPlayerCount = config.players?.defaultPlayerCount;
  const defaultPlayerCount =
    normalizedDefaultPlayerCount === undefined
      ? undefined
      : Math.max(1, Math.floor(Number(normalizedDefaultPlayerCount)) || 1);

  return {
    ...config,
    counters: normalizedCounters,
    players: config.players
      ? {
          defaultPlayerCount,
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
  const manifest = parseDocument(manifestRaw, { version: '1.1' }).toJSON() as BundledGameConfigManifest;
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
