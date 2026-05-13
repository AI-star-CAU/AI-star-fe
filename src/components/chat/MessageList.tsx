import React, { useEffect, useRef } from 'react';
import type { Message } from '../../api/ait';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  userName: string;
  branchMarkerLabel?: string;
  branchStartIndex?: number;
  onBranch?: (messageId: string) => void;
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

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading,
  userName,
  branchMarkerLabel,
  branchStartIndex,
  onBranch,
}) => {
  const endRef = useRef<HTMLDivElement>(null);
  const shouldShowBranchMarker = branchMarkerLabel !== undefined && branchStartIndex !== undefined;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 scroll-area p-6 space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
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
