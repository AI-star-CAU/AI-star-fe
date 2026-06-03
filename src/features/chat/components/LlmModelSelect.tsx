import React from 'react';
import { LLM_OPTIONS } from '../constants/llm';
import type { LlmModel } from '../types';

interface LlmModelSelectProps {
  /** 현재 선택된 모델 식별자 (명세 §2.1 llmModel). */
  value: LlmModel;
  onChange: (model: LlmModel) => void;
  disabled?: boolean;
}

/**
 * 명세 §2.1 / FR-10.1: 새 대화 생성 시 사용할 LLM provider/model 선택.
 * Phase 2 는 provider 당 모델 1개라 모델 식별자만으로 충분하다.
 */
const LlmModelSelect: React.FC<LlmModelSelectProps> = ({
  value,
  onChange,
  disabled = false,
}) => (
  <label className="flex items-center gap-2 text-xs text-ui-text-faint">
    <span>모델</span>
    <select
      value={value}
      onChange={e => onChange(e.target.value as LlmModel)}
      disabled={disabled}
      className="bg-ui-surface-subtle border border-ui-line-muted rounded-lg px-2.5 py-1.5 text-xs text-ui-text-muted focus:outline-none focus:ring-2 focus:ring-ui-accent-muted disabled:opacity-60"
    >
      {LLM_OPTIONS.map(opt => (
        <option key={opt.model} value={opt.model}>
          {opt.label}
        </option>
      ))}
    </select>
  </label>
);

export default LlmModelSelect;
