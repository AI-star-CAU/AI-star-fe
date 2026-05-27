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
    <div
      className="nm-composer"
      style={isFloating ? { boxShadow: '8px 8px 0 var(--paper-aged)' } : undefined}
    >
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
          {isCanceling ? '중단 중…' : '중단 ◼'}
        </button>
      ) : (
        <button
          type="button"
          onClick={onSend}
          disabled={!value.trim() || isSending}
          className="send"
          aria-label="메시지 보내기"
        >
          {isSending ? '발행 중…' : '발행 ▸'}
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
        borderTop: '1px solid var(--rule)',
        background: 'linear-gradient(180deg, transparent 0%, var(--paper-aged) 100%)',
        flexShrink: 0,
      }}
    >
      {composer}
      <p
        style={{
          textAlign: 'center',
          marginTop: 10,
          fontFamily: 'var(--type)',
          fontSize: 10,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: 'var(--ink-faint)',
        }}
      >
        AIT는 현재 백엔드 연결을 준비 중입니다.
      </p>
    </div>
  );
};

export default ChatInput;
