import React from 'react';
import ChatInput from '../../features/chat/components/ChatInput';
import LlmModelSelect from '../../features/chat/components/LlmModelSelect';
import type { LlmModel } from '../../features/chat/types';

interface NewChatLandingProps {
  userName?: string;

  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  onCancel: () => void;
  isCanceling: boolean;

  selectedModel: LlmModel;
  onSelectModel: (model: LlmModel) => void;
}

/**
 * /chat/new 진입 시 메시지가 없는 빈 상태 화면.
 * 모델 선택 + 첫 메시지 입력만 노출한다 (명세 §0.2.1 2단계 패턴의 1단계 UI).
 */
const NewChatLanding: React.FC<NewChatLandingProps> = ({
  userName,
  input,
  onInputChange,
  onSend,
  isSending,
  onCancel,
  isCanceling,
  selectedModel,
  onSelectModel,
}) => (
  <div className="flex-1 flex items-center justify-center px-5 pb-20">
    <div className="w-full max-w-2xl text-center">
      <div className="mb-7">
        <h1 className="nm-headline xl mb-3">
          안녕하세요, <span style={{ color: 'var(--gold)' }}>{userName ?? '사용자'}</span>님
        </h1>
        <p className="nm-lede">오늘은 어떤 대화를 시작해볼까요?</p>
      </div>
      <div className="mb-3 flex justify-center">
        <LlmModelSelect
          value={selectedModel}
          onChange={onSelectModel}
          disabled={isSending}
        />
      </div>
      <ChatInput
        value={input}
        onChange={onInputChange}
        onSend={onSend}
        isSending={isSending}
        onCancel={onCancel}
        isCanceling={isCanceling}
        variant="floating"
      />
    </div>
  </div>
);

export default NewChatLanding;
