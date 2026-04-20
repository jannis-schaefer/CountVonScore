import { load as loadYaml } from 'js-yaml';
import type { GameConfig } from '../store/gameStore';

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
