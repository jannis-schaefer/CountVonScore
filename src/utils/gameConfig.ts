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

  return parsed as GameConfig;
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
