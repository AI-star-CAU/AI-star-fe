import React, { useState, useCallback } from 'react';
import Button from '../../../shared/components/ui/Button';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  userName: string;
  onBranch?: (messageId: string) => void;
}

const CopyIcon: React.FC = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const BranchIcon: React.FC = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M6 3v12m0 0a3 3 0 100 6 3 3 0 000-6zm0 0h6m6-9a3 3 0 100-6 3 3 0 000 6zm0 0v12" />
  </svg>
);

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, userName, onBranch }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!message.content) return;
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [message.content]);

  return (
    <div id={`msg-${message.id}`} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${
          isUser ? 'bg-gradient-to-br from-cyan-400 to-teal-500 text-slate-950' : 'bg-cyan-700'
        }`}
      >
        {isUser ? userName[0] : 'A'}
      </div>

      <div className="flex flex-col gap-1.5 min-w-0">
        <div className={isUser ? 'bubble-user' : 'bubble-ai'}>
          {message.isPending ? (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce animation-delay-150" />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce animation-delay-300" />
              </div>
              <span className="text-xs">응답 대기 중...</span>
            </div>
          ) : (
            <span className="whitespace-pre-wrap">{message.content}</span>
          )}
        </div>

        {!isUser && !message.isPending && (
          <div className="flex items-center gap-1.5 pl-1">
            <Button
              onClick={handleCopy}
              variant="custom"
              size="sm"
              className="gap-1 px-2 py-1 rounded-lg text-[11px] text-slate-500 hover:text-slate-300 hover:bg-slate-800"
            >
              <CopyIcon />
              {copied ? '복사됨' : '복사'}
            </Button>
            <Button
              onClick={() => onBranch?.(message.id)}
              variant="custom"
              size="sm"
              className="gap-1 px-2 py-1 rounded-lg text-[11px] text-slate-500 hover:text-amber-400 hover:bg-slate-800"
            >
              <BranchIcon />
              분기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
