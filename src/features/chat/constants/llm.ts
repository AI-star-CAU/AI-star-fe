import type { LlmModel, LlmProvider } from '../types';

export interface LlmOption {
  provider: LlmProvider;
  model: LlmModel;
  label: string;
}

/**
 * 명세 §2.1: Phase 2 가 지원하는 provider/model 조합.
 * Phase 2 에선 provider 당 모델이 1개라 단일 선택으로 충분하다.
 */
export const LLM_OPTIONS: readonly LlmOption[] = [
  { provider: 'LOCAL', model: 'local-default', label: 'Gemma 4 E2B IT' },
  { provider: 'OPENAI', model: 'gpt-4o-mini', label: 'OpenAI · GPT-4o mini' },
  { provider: 'GOOGLE', model: 'gemini-2.0-flash', label: 'Google · Gemini 2.0 Flash' },
  { provider: 'ANTHROPIC', model: 'claude-3.5-sonnet', label: 'Anthropic · Claude 3.5 Sonnet' },
] as const;

export const DEFAULT_LLM_OPTION = LLM_OPTIONS[0];
