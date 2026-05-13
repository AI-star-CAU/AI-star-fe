import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useConversations } from '../hooks/useConversations';
import { useMessages } from '../hooks/useMessages';
import { useSendMessage } from '../hooks/useSendMessage';
import { isKnownId } from '../api/ait';
import ChatHeader from '../components/chat/ChatHeader';
import ConvSidebar from '../components/chat/ConvSidebar';
import MessageList from '../components/chat/MessageList';
import ChatInput from '../components/chat/ChatInput';
import ResizeHandle from '../components/chat/ResizeHandle';
import { useResizeDrag } from '../hooks/useResizeDrag';
import type { Message } from '../api/ait';

function getMessagesThroughFork(messages: Message[], forkAtTurnIndex: number): Message[] {
  const prefixMessages: Message[] = [];
  let userTurnCount = 0;

  for (const message of messages) {
    if (message.role === 'user') {
      userTurnCount += 1;
      if (userTurnCount > forkAtTurnIndex) break;
    }

    prefixMessages.push(message);
  }

  return prefixMessages;
}

function removePreTurnAssistantMessages(messages: Message[]): Message[] {
  const firstUserMessageIndex = messages.findIndex(message => message.role === 'user');
  if (firstUserMessageIndex < 0) return [];
  return messages.slice(firstUserMessageIndex);
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { convId } = useParams<{ convId: string }>();
  const { user, logout } = useAuth();

  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { size: sidebarWidth, onMouseDown: onSidebarResize } = useResizeDrag(240, 'x', 160, 480);

  const activeConvId = convId ?? 'new';

  const { data: conversations = [], isLoading: convsLoading } = useConversations();
  const { data: messages = [], isLoading: msgsLoading } = useMessages(activeConvId);
  const { mutate: sendMessage, isPending: isSending } = useSendMessage(activeConvId);

  const activeConv = useMemo(
    () => conversations.find(c => c.id === activeConvId),
    [conversations, activeConvId],
  );
  const activeBranch = useMemo(
    () => conversations.flatMap(c => c.branches).find(branch => branch.id === activeConvId),
    [conversations, activeConvId],
  );
  const activeParentConv = useMemo(
    () => conversations.find(conversation => conversation.id === activeBranch?.parentConvId),
    [activeBranch, conversations],
  );
  const activeBranchNumber = useMemo(
    () => {
      if (!activeBranch || !activeParentConv) return null;
      const index = activeParentConv.branches.findIndex(branch => branch.id === activeBranch.id);
      return index >= 0 ? index + 1 : null;
    },
    [activeBranch, activeParentConv],
  );
  const { data: parentMessages = [], isLoading: parentMsgsLoading } = useMessages(
    activeBranch?.parentConvId ?? '',
  );
  const visibleMessages = useMemo(
    () => {
      const normalizedMessages = removePreTurnAssistantMessages(messages);
      if (!activeBranch) {
        return {
          messages: normalizedMessages,
          branchStartIndex: undefined,
        };
      }

      const parentPrefixMessages = getMessagesThroughFork(
        removePreTurnAssistantMessages(parentMessages),
        activeBranch.forkAtTurnIndex,
      );

      return {
        messages: [...parentPrefixMessages, ...normalizedMessages],
        branchStartIndex: parentPrefixMessages.length,
      };
    },
    [activeBranch, parentMessages, messages],
  );
  const isMessagesLoading = msgsLoading || (!!activeBranch && parentMsgsLoading);

  const isNewChatEmpty = activeConvId === 'new' && !msgsLoading && messages.length === 0;

  useEffect(() => {
    if (!convsLoading && conversations.length > 0 && activeConvId !== 'new' && !isKnownId(activeConvId)) {
      navigate(`/chat/${conversations[0].id}`, { replace: true });
    }
  }, [convsLoading, conversations, activeConvId, navigate]);

  const handleSend = useCallback(() => {
    const content = input.trim();
    if (!content || isSending) return;
    setInput('');
    sendMessage(content);
  }, [input, isSending, sendMessage]);

  return (
    <div className="h-screen flex flex-col bg-slate-950 overflow-hidden">
      <ChatHeader
        userName={user?.name}
        userEmail={user?.email}
        plan={user?.plan}
        onLogout={logout}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
      />

      <div className="flex flex-1 overflow-hidden">
        <ConvSidebar
          conversations={conversations}
          isLoading={convsLoading}
          activeId={activeConvId}
          messages={messages}
          conv={activeConv}
          isOpen={sidebarOpen}
          width={sidebarWidth}
        />

        {sidebarOpen && (
          <ResizeHandle direction="x" onMouseDown={onSidebarResize} />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          {isNewChatEmpty ? (
            <div className="flex-1 flex items-center justify-center px-5 pb-20">
              <div className="w-full max-w-2xl">
                <div className="mb-7 text-center">
                  <p className="text-3xl font-black tracking-tight text-white">
                    안녕하세요, {user?.name ?? '사용자'}님
                  </p>
                  <p className="mt-3 text-sm text-slate-500">
                    오늘은 어떤 대화를 시작해볼까요?
                  </p>
                </div>
                <ChatInput
                  value={input}
                  onChange={setInput}
                  onSend={handleSend}
                  isSending={isSending}
                  variant="floating"
                />
              </div>
            </div>
          ) : (
            <>
              <MessageList
                messages={visibleMessages.messages}
                isLoading={isMessagesLoading}
                userName={user?.name ?? '나'}
                branchMarkerLabel={activeBranchNumber ? `B${activeBranchNumber}` : undefined}
                branchStartIndex={visibleMessages.branchStartIndex}
              />
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={handleSend}
                isSending={isSending}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
