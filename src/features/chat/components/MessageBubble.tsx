import React, { useState, useCallback, useRef } from 'react';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  userName: string;
  onBranch?: (messageId: string, originChatId: string) => void;
  onRegenerate?: (messageId: string, originChatId: string) => void;
  onEdit?: (messageId: string, content: string, originChatId: string) => void;
  /** 마지막(leaf) assistant 메시지에서만 재생성 버튼을 노출한다. */
  canRegenerate?: boolean;
}

const actionBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--type)',
  fontSize: 10,
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--ink-3)',
  padding: '4px 8px',
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px dotted transparent',
  transition: 'all 0.15s',
};

const statusTextStyle: React.CSSProperties = {
  fontFamily: 'var(--type)',
  fontSize: 10,
  letterSpacing: '0.16em',
  textTransform: 'uppercase',
};

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  userName,
  onBranch,
  onRegenerate,
  onEdit,
  canRegenerate = false,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isAssistantLoading =
    !isUser &&
    (message.status === 'STREAMING' ||
      (!message.content && message.status !== 'FAILED' && message.status !== 'CANCELED'));
  const showPending = message.isPending || isAssistantLoading;

  const handleCopy = useCallback(async () => {
    if (!message.content) return;
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [message.content]);

  const handleEditSubmit = useCallback(() => {
    const trimmed = editContent.trim();
    if (!trimmed || trimmed === message.content) {
      setEditing(false);
      return;
    }
    onEdit?.(message.id, trimmed, message.conversationId);
    setEditing(false);
  }, [editContent, message.content, message.conversationId, message.id, onEdit]);

  const pendingDots = (
    <div className="flex items-center gap-2" style={{ color: 'var(--ink-3)' }}>
      <span
        className="inline-block w-1.5 h-1.5 rounded-full animate-bounce"
        style={{ background: 'var(--ink-3)' }}
      />
      <span
        className="inline-block w-1.5 h-1.5 rounded-full animate-bounce animation-delay-150"
        style={{ background: 'var(--ink-3)' }}
      />
      <span
        className="inline-block w-1.5 h-1.5 rounded-full animate-bounce animation-delay-300"
        style={{ background: 'var(--ink-3)' }}
      />
      <span style={statusTextStyle}>편집국 작성 중</span>
    </div>
  );

  if (isUser) {
    return (
      <div id={`msg-${message.id}`} data-turn-id={message.turnId} className="mt-6 mb-3">
        <div className="nm-letter">
          <p className="nm-letter-from">FROM. {userName}</p>
          {editing ? (
            <div className="flex flex-col gap-2">
              <textarea
                ref={textareaRef}
                autoFocus
                aria-label="메시지 수정"
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEditSubmit();
                  }
                  if (e.key === 'Escape') {
                    setEditing(false);
                    setEditContent(message.content);
                  }
                }}
                className="w-full outline-none resize-none"
                rows={3}
                style={{
                  fontFamily: 'var(--body)',
                  fontStyle: 'italic',
                  fontSize: 15,
                  color: 'var(--ink)',
                  background: 'transparent',
                  border: '1px dashed var(--rule-thin)',
                  padding: '8px 10px',
                }}
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setEditing(false);
                    setEditContent(message.content);
                  }}
                  style={actionBtnStyle}
                >
                  취소
                </button>
                <button
                  onClick={handleEditSubmit}
                  style={{ ...actionBtnStyle, color: 'var(--red-deep)' }}
                >
                  재발신 ▸
                </button>
              </div>
            </div>
          ) : (
            <p className="nm-letter-body">{message.content}</p>
          )}
        </div>
        {!showPending && !editing && (
          <div className="flex justify-end mt-1">
            <button
              onClick={() => {
                setEditing(true);
                setEditContent(message.content);
              }}
              style={actionBtnStyle}
            >
              ✎ 수정
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id={`msg-${message.id}`} data-turn-id={message.turnId} className="mb-6">
      <div className="nm-article">
        <p
          className="nm-byline"
          style={{ marginBottom: 10 }}
        >
          <b>BY.</b> AIT · EDITORIAL
        </p>
        {showPending ? (
          pendingDots
        ) : (
          <div className="nm-article-body">{message.content}</div>
        )}
      </div>

      {!showPending && (
        <div className="flex items-center gap-1 mt-2">
          <button onClick={handleCopy} style={actionBtnStyle}>
            ⎘ {copied ? '복사됨' : '복사'}
          </button>
          {!!message.turnId && (
            <button
              onClick={() => onBranch?.(message.id, message.conversationId)}
              style={{ ...actionBtnStyle, color: 'var(--red-deep)' }}
            >
              ⤴ 호외 발행
            </button>
          )}
          {!!message.turnId && canRegenerate && (
            <button
              onClick={() => onRegenerate?.(message.id, message.conversationId)}
              style={actionBtnStyle}
            >
              ↻ 재집필
            </button>
          )}
        </div>
      )}

      {message.status === 'CANCELED' && (
        <span style={{ ...statusTextStyle, color: 'var(--gold)' }}>응답이 취소되었습니다</span>
      )}
      {message.status === 'FAILED' && (
        <span style={{ ...statusTextStyle, color: 'var(--red-deep)' }}>응답 생성에 실패했습니다</span>
      )}
    </div>
  );
};

export default MessageBubble;
