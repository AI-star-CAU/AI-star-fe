import React, { useState, useCallback, useRef } from 'react';
import Button from '../../../shared/components/ui/Button';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  userName: string;
  onBranch?: (messageId: string) => void;
  onRegenerate?: (messageId: string) => void;
  onEdit?: (messageId: string, content: string) => void;
  /** 마지막(leaf) assistant 메시지에서만 재생성 버튼을 노출한다. */
  canRegenerate?: boolean;
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

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, userName, onBranch, onRegenerate, onEdit, canRegenerate = false }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // assistant 메시지가 아직 저장 중(STREAMING)이거나, 종료됐는데 content가 비어 있고
  // 에러 상태도 아닌 백엔드 race window 동안은 pending UI 로 표시한다.
  const isAssistantLoading =
    !isUser &&
    (message.status === 'STREAMING' ||
      (!message.content &&
        message.status !== 'FAILED' &&
        message.status !== 'CANCELED'));
  const showPending = message.isPending || isAssistantLoading;

  const handleCopy = useCallback(async () => {
    if (!message.content) return;
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [message.content]);

  const handleEditSubmit = useCallback(() => {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === message.content) { setEditing(false); return; }
    onEdit?.(message.id, trimmed);
    setEditing(false);
  }, [editContent, message.content, message.id, onEdit]);

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
          {showPending ? (
            <div className="flex items-center gap-2 text-slate-400">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce animation-delay-150" />
                <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce animation-delay-300" />
              </div>
              <span className="text-xs">응답 대기 중...</span>
            </div>
          ) : editing ? (
            <div className="flex flex-col gap-2">
              <textarea
                ref={textareaRef}
                autoFocus
                aria-label="메시지 수정"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditSubmit(); }
                  if (e.key === 'Escape') { setEditing(false); setEditContent(message.content); }
                }}
                className="w-full min-w-[200px] bg-slate-700 text-slate-100 text-sm rounded-lg px-3 py-2 outline-none resize-none"
                rows={3}
              />
              <div className="flex gap-2 justify-end">
                <Button onClick={() => { setEditing(false); setEditContent(message.content); }} variant="custom" size="sm" className="text-xs text-slate-400 hover:text-slate-200 px-2 py-1">취소</Button>
                <Button onClick={handleEditSubmit} variant="custom" size="sm" className="text-xs text-cyan-400 hover:text-cyan-300 px-2 py-1">전송</Button>
              </div>
            </div>
          ) : (
            <span className="whitespace-pre-wrap">{message.content}</span>
          )}
        </div>

        {!isUser && message.status === 'CANCELED' && (
          <span className="pl-1 text-[11px] text-amber-500/80">
            응답이 취소되었습니다
          </span>
        )}
        {!isUser && message.status === 'FAILED' && (
          <span className="pl-1 text-[11px] text-red-400/80">
            응답 생성에 실패했습니다
          </span>
        )}
        {isUser && !showPending && !editing && (
          <div className="flex items-center gap-1.5 pr-1 justify-end">
            <Button
              onClick={() => { setEditing(true); setEditContent(message.content); }}
              variant="custom"
              size="sm"
              className="gap-1 px-2 py-1 rounded-lg text-[11px] text-slate-500 hover:text-slate-300 hover:bg-slate-800"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              수정
            </Button>
          </div>
        )}

        {!isUser && !showPending && (
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
            {!!message.turnId && (
              <Button
                onClick={() => onBranch?.(message.id)}
                variant="custom"
                size="sm"
                className="gap-1 px-2 py-1 rounded-lg text-[11px] text-slate-500 hover:text-amber-400 hover:bg-slate-800"
              >
                <BranchIcon />
                분기
              </Button>
            )}
            {!!message.turnId && canRegenerate && (
              <Button
                onClick={() => onRegenerate?.(message.id)}
                variant="custom"
                size="sm"
                className="gap-1 px-2 py-1 rounded-lg text-[11px] text-slate-500 hover:text-cyan-400 hover:bg-slate-800"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                재생성
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
