import React, { useEffect, useRef, useCallback } from 'react';
import Button from '../../../shared/components/ui/Button';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  variant?: 'dock' | 'floating';
}

const ChatInput: React.FC<ChatInputProps> = ({
  value,
  onChange,
  onSend,
  isSending,
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

  return (
    <div
      className={
        isFloating
          ? 'w-full rounded-3xl border border-slate-700/70 bg-slate-900/95 p-3 shadow-2xl shadow-black/30'
          : 'p-4 border-t border-slate-800 flex-shrink-0'
      }
    >
      <div className="flex gap-3 items-end">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="무엇이든 물어보세요"
          rows={1}
          disabled={isSending}
          className="flex-1 input-dark resize-none leading-relaxed disabled:opacity-60"
          style={{ minHeight: '48px', maxHeight: '160px' }}
        />
        <Button
          onClick={onSend}
          disabled={!value.trim() || isSending}
          variant="primary"
          size="icon"
          className="flex-shrink-0 disabled:bg-slate-800 disabled:text-slate-500"
          aria-label="메시지 보내기"
        >
          {isSending ? (
            <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </Button>
      </div>
      {!isFloating && (
        <p className="text-[10px] text-slate-700 mt-2 text-center">
          AIT는 현재 백엔드 연결을 준비 중입니다.
        </p>
      )}
    </div>
  );
};

export default ChatInput;
