import { DEFAULT_LLM_OPTION } from '../chat/constants/llm';
import type { InterfaceLanguage, ThemeMode, UserSettings } from './types';

export const DEFAULT_SETTINGS: UserSettings = {
  defaultLlmModel: DEFAULT_LLM_OPTION.model,
  themeMode: 'system',
  language: 'ko',
};

export const THEME_OPTIONS: readonly {
  value: ThemeMode;
  label: string;
  description: string;
}[] = [
  { value: 'system', label: '시스템', description: '기기 설정을 따릅니다' },
  { value: 'dark', label: '다크', description: '어두운 화면을 유지합니다' },
];

export const LANGUAGE_OPTIONS: readonly {
  value: InterfaceLanguage;
  label: string;
  description: string;
}[] = [
  { value: 'ko', label: '한국어', description: '기본 인터페이스 언어' },
  { value: 'en', label: 'English', description: '영문 인터페이스 언어' },
];
