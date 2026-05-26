import type { LlmModel } from '../chat/types';

export type ThemeMode = 'system' | 'dark';
export type InterfaceLanguage = 'ko' | 'en';

export interface UserSettings {
  defaultLlmModel: LlmModel;
  themeMode: ThemeMode;
  language: InterfaceLanguage;
}
