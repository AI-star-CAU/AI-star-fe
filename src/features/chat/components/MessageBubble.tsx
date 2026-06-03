import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
  userName: string;
  onBranch?: (messageId: string, originChatId: string) => void;
  onRegenerate?: (messageId: string, originChatId: string) => void;
  onEdit?: (messageId: string, content: string, originChatId: string) => void;
  /** 마지막(leaf) assistant 메시지에서만 재생성 버튼을 노출한다. */
  canRegenerate?: boolean;
  /** 진행 중인 assistant 응답을 한 번에 노출하지 않고 타이핑처럼 표시한다. */
  animateTyping?: boolean;
}

const actionBtnStyle: React.CSSProperties = {
  fontFamily: 'var(--body)',
  fontSize: 12,
  color: 'var(--ink-3)',
  padding: '4px 6px',
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  borderBottom: '1px dotted transparent',
  transition: 'all 0.15s',
};

const iconBtnStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 30,
  height: 30,
  padding: 0,
  borderRadius: 8,
  color: 'var(--ink-3)',
  cursor: 'pointer',
  background: 'transparent',
  border: 'none',
  transition: 'background 0.15s, color 0.15s',
};

const ICON_SIZE = 16;
const iconSvgProps = {
  width: ICON_SIZE,
  height: ICON_SIZE,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const CopyIcon: React.FC = () => (
  <svg {...iconSvgProps} aria-hidden="true">
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
);

const CheckIcon: React.FC = () => (
  <svg {...iconSvgProps} aria-hidden="true">
    <path d="M5 12l4 4 10-10" />
  </svg>
);

const BranchIcon: React.FC = () => (
  <svg {...iconSvgProps} aria-hidden="true">
    <circle cx="6" cy="5" r="2" />
    <circle cx="6" cy="19" r="2" />
    <circle cx="18" cy="7" r="2" />
    <path d="M6 7v10" />
    <path d="M18 9c0 4-6 4-6 8" />
  </svg>
);

const RegenerateIcon: React.FC = () => (
  <svg {...iconSvgProps} aria-hidden="true">
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);

const EditIcon: React.FC = () => (
  <svg {...iconSvgProps} aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
  </svg>
);

const statusTextStyle: React.CSSProperties = {
  fontFamily: 'var(--body)',
  fontSize: 12,
};

const TYPING_INTERVAL_MS = 30;

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  userName,
  onBranch,
  onRegenerate,
  onEdit,
  canRegenerate = false,
  animateTyping = false,
}) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [typedState, setTypedState] = useState({ messageId: '', content: '' });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typedContentRef = useRef('');
  const typedMessageIdRef = useRef('');
  const targetContentRef = useRef('');

  const hasAssistantContent = !isUser && message.content.length > 0;
  const isAssistantGenerating =
    !isUser &&
    (message.isPending === true ||
      message.status === 'STREAMING' ||
      (!message.content && message.status !== 'FAILED' && message.status !== 'CANCELED'));
  const showPending = isAssistantGenerating && !hasAssistantContent;
  const shouldAnimateTyping =
    !isUser &&
    message.content.length > 0 &&
    (animateTyping ||
      (typedState.messageId === message.id && typedState.content.length < message.content.length));
  const typedStateMatches =
    typedState.messageId === message.id && message.content.startsWith(typedState.content);
  const assistantContent =
    shouldAnimateTyping && typedStateMatches
      ? typedState.content
      : shouldAnimateTyping
        ? ''
        : message.content;
  const showTypingCaret =
    shouldAnimateTyping &&
    !showPending &&
    assistantContent.length < message.content.length;
  const showActions = !showPending && !isAssistantGenerating && !showTypingCaret;

  useEffect(() => {
    if (!shouldAnimateTyping) {
      targetContentRef.current = message.content;
      typedMessageIdRef.current = message.id;
      typedContentRef.current = message.content;
      return;
    }

    const sameMessage = typedMessageIdRef.current === message.id;
    typedMessageIdRef.current = message.id;
    targetContentRef.current = message.content;

    const nextLength =
      sameMessage && message.content.startsWith(typedContentRef.current)
        ? typedContentRef.current.length
        : 0;

    if (nextLength === 0) {
      typedContentRef.current = '';
    }

    if (nextLength >= message.content.length) {
      typedContentRef.current = message.content;
      return;
    }
  }, [message.content, message.id, shouldAnimateTyping]);

  useEffect(() => {
    if (!shouldAnimateTyping) return;

    const tick = () => {
      const targetContent = targetContentRef.current;
      const currentContent = typedContentRef.current;

      if (!targetContent || currentContent.length >= targetContent.length) {
        return;
      }

      const nextContent = targetContent.slice(
        0,
        Math.min(currentContent.length + 1, targetContent.length),
      );
      typedContentRef.current = nextContent;
      setTypedState({ messageId: typedMessageIdRef.current, content: nextContent });
    };

    const intervalId = window.setInterval(() => {
      tick();
      if (typedContentRef.current.length >= targetContentRef.current.length) {
        window.clearInterval(intervalId);
      }
    }, TYPING_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [message.id, shouldAnimateTyping]);

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
      <span style={statusTextStyle}>AI 응답 생성 중</span>
    </div>
  );

  if (isUser) {
    return (
      <div id={`msg-${message.id}`} data-turn-id={message.turnId} className="mt-6 mb-3">
        <div className="nm-letter">
          <p className="nm-letter-from">메시지 · {userName}</p>
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
                  전송
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
              type="button"
              onClick={() => {
                setEditing(true);
                setEditContent(message.content);
              }}
              style={iconBtnStyle}
              className="hover:bg-ui-surface-subtle hover:text-ui-text"
              aria-label="메시지 수정"
              title="메시지 수정"
            >
              <EditIcon />
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
          AI
        </p>
        {showPending ? (
          pendingDots
        ) : (
          <div className="nm-article-body">
            {assistantContent}
            {showTypingCaret && <span className="typing-caret" aria-hidden="true" />}
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex items-center gap-1 mt-2">
          <button
            type="button"
            onClick={handleCopy}
            style={iconBtnStyle}
            className="hover:bg-ui-surface-subtle hover:text-ui-text"
            aria-label={copied ? '복사됨' : '복사'}
            title={copied ? '복사됨' : '복사'}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
          </button>
          {!!message.turnId && (
            <button
              type="button"
              onClick={() => onBranch?.(message.id, message.conversationId)}
              style={{ ...iconBtnStyle, color: 'var(--red-deep)' }}
              className="hover:bg-ui-surface-subtle"
              aria-label="분기 만들기"
              title="분기 만들기"
            >
              <BranchIcon />
            </button>
          )}
          {!!message.turnId && canRegenerate && (
            <button
              type="button"
              onClick={() => onRegenerate?.(message.id, message.conversationId)}
              style={iconBtnStyle}
              className="hover:bg-ui-surface-subtle hover:text-ui-text"
              aria-label="다시 생성"
              title="다시 생성"
            >
              <RegenerateIcon />
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
