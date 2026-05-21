import React from 'react';
import MessageList from '../../features/chat/components/MessageList';
import ChatInput from '../../features/chat/components/ChatInput';
import type { Message } from '../../features/chat/types';

interface VisibleMessages {
  messages: Message[];
  branchStartIndex: number | undefined;
}

interface ConversationViewProps {
  // 메시지 리스트
  visibleMessages: VisibleMessages;
  isMessagesLoading: boolean;
  userName: string;
  activeBranchMarkerLabel: string | undefined;
  hasOlder: boolean | undefined;
  isLoadingOlder: boolean;
  onLoadOlder: () => void;
  onBranch: (messageId: string, originChatId: string) => void;
  onRegenerate: (messageId: string, originChatId: string) => void;
  onEdit: (messageId: string, content: string, originChatId: string) => void;
  targetTurnId: number | undefined;
  onTargetTurnReached: () => void;

  // 입력
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
  onCancel: () => void;
  isCanceling: boolean;
}

/**
 * /chat/:convId 또는 'new' 에서 메시지 한 통이라도 있는 상태의 대화 화면.
 * (스트리밍 시작 직후의 옵티미스틱 메시지도 여기서 렌더링.)
 */
const ConversationView: React.FC<ConversationViewProps> = ({
  visibleMessages,
  isMessagesLoading,
  userName,
  activeBranchMarkerLabel,
  hasOlder,
  isLoadingOlder,
  onLoadOlder,
  onBranch,
  onRegenerate,
  onEdit,
  targetTurnId,
  onTargetTurnReached,
  input,
  onInputChange,
  onSend,
  isSending,
  onCancel,
  isCanceling,
}) => (
  <>
    <MessageList
      messages={visibleMessages.messages}
      isLoading={isMessagesLoading}
      userName={userName}
      branchMarkerLabel={activeBranchMarkerLabel}
      branchStartIndex={visibleMessages.branchStartIndex}
      hasOlder={hasOlder}
      isLoadingOlder={isLoadingOlder}
      onLoadOlder={onLoadOlder}
      onBranch={onBranch}
      onRegenerate={onRegenerate}
      onEdit={onEdit}
      targetTurnId={targetTurnId}
      onTargetTurnReached={onTargetTurnReached}
    />
    <ChatInput
      value={input}
      onChange={onInputChange}
      onSend={onSend}
      isSending={isSending}
      onCancel={onCancel}
      isCanceling={isCanceling}
    />
  </>
);

export default ConversationView;
