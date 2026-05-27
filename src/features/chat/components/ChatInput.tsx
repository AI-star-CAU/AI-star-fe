import React, { useEffect, useRef, useCallback } from 'react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  /** 명세 §2.6: 스트리밍 중 응답 생성 취소. */
  onCancel?: () => void;
  isCanceling?: boolean;
  variant?: 'dock' | 'floating';
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isSending,
  onCancel,
  isCanceling = false,
  variant = 'dock',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isFloating = variant === 'floating';

  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [value]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    },
    [onSend],
  );

  const composer = (
    <div className="nm-composer">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="무엇이든 물어보세요"
        rows={1}
        disabled={isSending}
        style={{ minHeight: 36, maxHeight: 160 }}
      />
      {isSending && onCancel ? (
        <button
          type="button"
          onClick={onCancel}
          disabled={isCanceling}
          className="send"
          style={{ background: 'var(--red)', borderColor: 'var(--red)' }}
          aria-label="응답 생성 취소"
        >
          {isCanceling ? '중지 중...' : '중지'}
        </button>
      ) : (
        <button
          type="button"
          onClick={onSend}
          disabled={!value.trim() || isSending}
          className="send"
          aria-label="메시지 보내기"
        >
          {isSending ? '생성 중...' : '보내기'}
        </button>
      )}
    </div>
  );

  if (isFloating) {
    return composer;
  }

  return (
    <div
      style={{
        padding: '20px 32px 24px',
        borderTop: '1px solid var(--paper-aged)',
        background: 'var(--paper)',
        flexShrink: 0,
      }}
    >
      {composer}
    </div>
  );
};

export default ChatInput;
