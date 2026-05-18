import React, { useEffect, useLayoutEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  userName: string;
  branchMarkerLabel?: string;
  branchStartIndex?: number;
  onBranch?: (messageId: string) => void;
  /** 명세 §2.4: 더 불러올 과거 페이지가 있는지 */
  hasOlder?: boolean;
  isLoadingOlder?: boolean;
  onLoadOlder?: () => void;
}

const BranchMarker: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-3 py-1">
    <div className="h-px flex-1 border-t border-dashed border-amber-500/50" />
    <span className="rounded-full border border-amber-500/50 bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-300">
      {label}
    </span>
    <div className="h-px flex-1 border-t border-dashed border-amber-500/50" />
  </div>
);

/** 초기 로딩 스켈레톤 — 대화 버블 형태를 흉내낸 placeholder. */
const MessageListSkeleton: React.FC = () => (
  <div className="space-y-6" aria-hidden="true">
    {[
      { me: false, w: 'w-3/5' },
      { me: true, w: 'w-2/5' },
      { me: false, w: 'w-4/5' },
      { me: true, w: 'w-1/3' },
      { me: false, w: 'w-1/2' },
    ].map((row, i) => (
      <div
        key={i}
        className={`flex items-start gap-3 ${row.me ? 'flex-row-reverse' : ''}`}
      >
        <div className="w-7 h-7 rounded-lg bg-slate-800 animate-pulse flex-shrink-0" />
        <div className={`flex flex-col gap-2 ${row.w}`}>
          <div className="h-4 rounded-lg bg-slate-800 animate-pulse" />
          <div className="h-4 w-3/4 rounded-lg bg-slate-800/70 animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

/** 과거 페이지를 불러오는 동안 목록 상단에 띄우는 작은 스켈레톤. */
const OlderLoadingSkeleton: React.FC = () => (
  <div className="space-y-3 pb-2" aria-hidden="true">
    <div className="flex items-center justify-center">
      <span className="text-[11px] text-slate-600">이전 대화 불러오는 중…</span>
    </div>
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-slate-800 animate-pulse flex-shrink-0" />
      <div className="flex flex-col gap-2 w-1/2">
        <div className="h-4 rounded-lg bg-slate-800 animate-pulse" />
        <div className="h-4 w-2/3 rounded-lg bg-slate-800/70 animate-pulse" />
      </div>
    </div>
  </div>
);

const SCROLL_TOP_THRESHOLD = 64;

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  userName,
  branchMarkerLabel,
  branchStartIndex,
  onBranch,
  hasOlder = false,
  isLoadingOlder = false,
  onLoadOlder,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  // prepend(과거 로드) 시 스크롤 점프를 막기 위한 직전 scrollHeight 기억.
  const prependAnchorRef = useRef<number | null>(null);
  const shouldShowBranchMarker =
    branchMarkerLabel !== undefined && branchStartIndex !== undefined;

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
    if (prependAnchorRef.current != null) {
      el.scrollTop = el.scrollHeight - prependAnchorRef.current;
      prependAnchorRef.current = null;
      return;
    }
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 대화 전환/초기 로딩 종료 시 맨 아래에서 시작.
  useEffect(() => {
    if (!isLoading) {
      endRef.current?.scrollIntoView({ behavior: 'auto' });
    }
  }, [isLoading]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="flex-1 scroll-area p-6 space-y-6"
    >
      {isLoading ? (
        <MessageListSkeleton />
      ) : (
        <>
          {isLoadingOlder && <OlderLoadingSkeleton />}
          {messages.map((msg, index) => (
            <React.Fragment key={msg.id}>
              {shouldShowBranchMarker && index === branchStartIndex && (
                <BranchMarker label={branchMarkerLabel} />
              )}
              <MessageBubble message={msg} userName={userName} onBranch={onBranch} />
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
