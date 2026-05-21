import { STORAGE_KEYS } from '../../../shared/constants/storageKeys';
import { LLM_OPTIONS } from '../../chat/constants/llm';
import { DEFAULT_SETTINGS } from '../constants';
import type { InterfaceLanguage, ThemeMode, UserSettings } from '../types';

const validModels = new Set(LLM_OPTIONS.map(option => option.model));
const validThemes = new Set<ThemeMode>(['system', 'dark']);
const validLanguages = new Set<InterfaceLanguage>(['ko', 'en']);

function normalizeSettings(value: Partial<UserSettings> | null): UserSettings {
  return {
    defaultLlmModel:
      value?.defaultLlmModel && validModels.has(value.defaultLlmModel)
        ? value.defaultLlmModel
        : DEFAULT_SETTINGS.defaultLlmModel,
    themeMode:
      value?.themeMode && validThemes.has(value.themeMode)
        ? value.themeMode
        : DEFAULT_SETTINGS.themeMode,
    language:
      value?.language && validLanguages.has(value.language)
        ? value.language
        : DEFAULT_SETTINGS.language,
  };
}

export function readSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return normalizeSettings(JSON.parse(raw) as Partial<UserSettings>);
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: UserSettings): void {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}
