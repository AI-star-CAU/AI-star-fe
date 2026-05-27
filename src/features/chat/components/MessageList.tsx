import React, { useEffect, useLayoutEffect, useReducer, useRef } from 'react';
import MessageBubble from './MessageBubble';
import type { Message } from '../types';

interface MessageListProps {
  conversationId: string;
  messages: Message[];
  isLoading: boolean;
  userName: string;
  branchMarkerLabel?: string;
  branchStartIndex?: number;
  onBranch?: (messageId: string, originChatId: string) => void;
  hasOlder?: boolean;
  isLoadingOlder?: boolean;
  onLoadOlder?: () => void;
  onRegenerate?: (messageId: string, originChatId: string) => void;
  onEdit?: (messageId: string, content: string, originChatId: string) => void;
  targetTurnId?: number;
  onTargetTurnReached?: () => void;
}

const BranchMarker: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-3 py-2">
    <div className="h-px flex-1" style={{ borderTop: '1px dashed var(--red)' }} />
    <span className="nm-extra-tag">{label}</span>
    <div className="h-px flex-1" style={{ borderTop: '1px dashed var(--red)' }} />
  </div>
);

const skeletonBar: React.CSSProperties = {
  background: 'var(--paper-aged)',
  opacity: 0.6,
};

/** 초기 로딩 스켈레톤 — 메시지 박스 형태. */
const MessageListSkeleton: React.FC = () => (
  <div className="space-y-6" aria-hidden="true">
    {[
      { letter: true, lines: 2 },
      { letter: false, lines: 4 },
      { letter: true, lines: 1 },
      { letter: false, lines: 3 },
    ].map((row, i) => (
      <div key={i} className={row.letter ? 'nm-letter' : 'nm-article'}>
        {row.letter && <p className="nm-letter-from">메시지 ...</p>}
        <div className="flex flex-col gap-2">
          {Array.from({ length: row.lines }).map((_, j) => (
            <div
              key={j}
              className="h-3 animate-pulse"
              style={{ ...skeletonBar, width: `${60 + (j * 7) % 35}%` }}
            />
          ))}
        </div>
      </div>
    ))}
  </div>
);

/** 과거 페이지를 불러오는 동안 목록 상단에 띄우는 작은 스켈레톤. */
const OlderLoadingSkeleton: React.FC = () => (
  <div className="space-y-2 pb-2" aria-hidden="true">
    <div className="flex items-center justify-center">
      <span
        style={{
          fontFamily: 'var(--type)',
          fontSize: 10,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
        }}
      >
        이전 대화 불러오는 중
      </span>
    </div>
    <div className="space-y-1">
      <div className="h-3 animate-pulse" style={{ ...skeletonBar, width: '70%' }} />
      <div className="h-3 animate-pulse" style={{ ...skeletonBar, width: '55%' }} />
    </div>
  </div>
);

const SCROLL_TOP_THRESHOLD = 64;

interface TypingAnimationState {
  conversationId: string;
  animatedIds: Set<string>;
  typingIds: Set<string>;
}

type TypingAnimationAction = {
  conversationId: string;
  messages: Message[];
};

const assistantIdsWithContent = (messages: Message[]) =>
  messages
    .filter(message => message.role === 'assistant' && message.content.length > 0)
    .map(message => message.id);

const typingAnimationReducer = (
  state: TypingAnimationState,
  action: TypingAnimationAction,
): TypingAnimationState => {
  const contentIds = assistantIdsWithContent(action.messages);

  if (state.conversationId !== action.conversationId) {
    return {
      conversationId: action.conversationId,
      animatedIds: new Set(contentIds),
      typingIds: new Set(),
    };
  }

  let nextAnimatedIds = state.animatedIds;
  let nextTypingIds = state.typingIds;
  let changed = false;

  for (const id of contentIds) {
    if (!nextAnimatedIds.has(id)) {
      if (!changed) {
        nextAnimatedIds = new Set(state.animatedIds);
        nextTypingIds = new Set(state.typingIds);
        changed = true;
      }
      nextAnimatedIds.add(id);
      nextTypingIds.add(id);
    }
  }

  if (!changed) return state;
  return {
    conversationId: state.conversationId,
    animatedIds: nextAnimatedIds,
    typingIds: nextTypingIds,
  };
};

const MessageList: React.FC<MessageListProps> = ({
  conversationId,
  messages,
  isLoading,
  userName,
  branchMarkerLabel,
  branchStartIndex,
  onBranch,
  hasOlder = false,
  isLoadingOlder = false,
  onLoadOlder,
  onRegenerate,
  onEdit,
  targetTurnId,
  onTargetTurnReached,
}) => {
  const [typingAnimation, syncTypingAnimation] = useReducer(typingAnimationReducer, {
    conversationId,
    animatedIds: new Set(assistantIdsWithContent(messages)),
    typingIds: new Set<string>(),
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  // prepend(과거 로드) 시 스크롤 점프를 막기 위한 직전 scrollHeight 기억.
  const prependAnchorRef = useRef<number | null>(null);
  const shouldShowBranchMarker =
    branchMarkerLabel !== undefined && branchStartIndex !== undefined;
  // 재생성은 가장 마지막(leaf) assistant 메시지에서만 노출한다.
  let lastAssistantIndex = -1;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'assistant') { lastAssistantIndex = i; break; }
  }

  useLayoutEffect(() => {
    syncTypingAnimation({ conversationId, messages });
  }, [conversationId, messages]);

  const handleScroll = () => {
    const el = containerRef.current;
    if (!el || !hasOlder || isLoadingOlder || !onLoadOlder) return;
    if (el.scrollTop <= SCROLL_TOP_THRESHOLD) {
      // 과거 로드 직전 현재 높이를 기억해 둔다(로드 후 위치 복원용).
      prependAnchorRef.current = el.scrollHeight;
      onLoadOlder();
    }
  };

  // 과거 페이지가 prepend 되면 보이던 위치를 유지하고,
  // 그 외(새 메시지/대화 진입)에는 맨 아래로 스크롤한다.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (targetTurnId != null) return;
    if (prependAnchorRef.current != null) {
      el.scrollTop = el.scrollHeight - prependAnchorRef.current;
      prependAnchorRef.current = null;
      return;
    }
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, targetTurnId]);

  // 대화 전환/초기 로딩 종료 시 맨 아래에서 시작.
  useEffect(() => {
    if (!isLoading && targetTurnId == null) {
      endRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [isLoading, targetTurnId]);

  useEffect(() => {
    if (targetTurnId == null || isLoading) return;

    const target = containerRef.current?.querySelector<HTMLElement>(
      `[data-turn-id="${targetTurnId}"]`,
    );
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      onTargetTurnReached?.();
      return;
    }

    if (hasOlder && !isLoadingOlder && onLoadOlder) {
      prependAnchorRef.current = containerRef.current?.scrollHeight ?? null;
      onLoadOlder();
    }
  }, [
    targetTurnId,
    messages,
    isLoading,
    hasOlder,
    isLoadingOlder,
    onLoadOlder,
    onTargetTurnReached,
  ]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 scroll-area p-6 space-y-6"
    >
      {isLoading && messages.length === 0 ? (
        <MessageListSkeleton />
      ) : (
        <>
          {isLoadingOlder && <OlderLoadingSkeleton />}
          {messages.map((msg, index) => (
            <React.Fragment key={msg.id}>
              {shouldShowBranchMarker && index === branchStartIndex && (
                <BranchMarker label={branchMarkerLabel} />
              )}
              <MessageBubble
                message={msg}
                userName={userName}
                onBranch={onBranch}
                onRegenerate={onRegenerate}
                onEdit={onEdit}
                canRegenerate={index === lastAssistantIndex}
                animateTyping={
                  msg.role === 'assistant' &&
                  (msg.isPending === true ||
                    msg.status === 'STREAMING' ||
                    typingAnimation.typingIds.has(msg.id))
                }
              />
            </React.Fragment>
          ))}
          {shouldShowBranchMarker && branchStartIndex === messages.length && (
            <BranchMarker label={branchMarkerLabel} />
          )}
        </>
      )}
      <div ref={endRef} />
    </div>
  );
};

export default MessageList;
