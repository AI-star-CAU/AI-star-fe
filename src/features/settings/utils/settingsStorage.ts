import {
  readStoredSettings,
  saveStoredSettings,
} from '../../../shared/storage/settingsStorage';
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
  return normalizeSettings(readStoredSettings<Partial<UserSettings>>());
}

export function saveSettings(settings: UserSettings): void {
  saveStoredSettings(settings);
}
