import React, { useEffect, useRef } from 'react';
import type { Message } from '../../api/ait';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  userName: string;
  onBranch?: (messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, userName, onBranch }) => {
  const endRef = useRef<HTMLDivElement>(null);

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
        messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} userName={userName} onBranch={onBranch} />
        ))
      )}
      <div ref={endRef} />
    </div>
  );
};

export default MessageList;
