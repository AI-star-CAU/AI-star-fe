import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useConversations } from '../../features/conversation-explorer/hooks/useConversations';
import { useMessages } from '../../features/chat/hooks/useMessages';
import { useSendMessage } from '../../features/chat/hooks/useSendMessage';
import { useRegenerate } from '../../features/chat/hooks/useRegenerate';
import { useEditMessage } from '../../features/chat/hooks/useEditMessage';
import { useCreateBranch } from '../../features/branch/hooks/useCreateBranch';
import { useChatRouteState } from './hooks/useChatRouteState';
import { useActiveConversation } from './hooks/useActiveConversation';
import { useBranchContext } from './hooks/useBranchContext';
import { useLiveMessageMerge } from './hooks/useLiveMessageMerge';
import ChatHeader from '../../features/chat/components/ChatHeader';
import ConvSidebar from '../../features/conversation-explorer/components/ConvSidebar';
import { LLM_OPTIONS, DEFAULT_LLM_OPTION } from '../../features/chat/constants/llm';
import type { LlmModel } from '../../features/chat/types';
import ResizeHandle from '../../shared/components/layout/ResizeHandle';
import { useResizeDrag } from '../../shared/hooks/useResizeDrag';
import { chatPath } from '../../app/router/routes';
import { readSettings } from '../../features/settings/utils/settingsStorage';
import type { CreateBranchResponse } from '../../features/branch/types';
import NewChatLanding from './NewChatLanding';
import ConversationView from './ConversationView';

/**
 * 채팅 화면의 데이터/상태 코디네이터.
 *
 * 사이드바·헤더는 항상 노출되며, 메인 패널은 다음 두 자식 컴포넌트로 위임한다:
 *  - {@link NewChatLanding} — /chat/new 빈 상태
 *  - {@link ConversationView} — 메시지가 1개라도 있는 대화 화면
 *
 * 라우터를 분기하지 않고 한 페이지 안에서 조건부 렌더링을 한다.
 * (사이드바가 항상 같은 데이터를 필요로 하므로 라우트 분할의 이득이 적음.)
 *
 * 파생 상태는 다음 훅으로 분리되어 있다 (동작 동일, 구조만 분해):
 *  - useChatRouteState      활성 대화 id / turnId 검색 파라미터
 *  - useActiveConversation  conversations + chatMeta fallback
 *  - useBranchContext       활성 분기 / 부모 메시지 / 분기 마커 라벨
 *  - useLiveMessageMerge    history + send/regenerate/edit live 메시지 병합
 */
const ChatLayout: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { activeConvId, targetTurnId, handleTargetTurnReached } = useChatRouteState();

  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [optimisticBranch, setOptimisticBranch] = useState<CreateBranchResponse | null>(null);
  // 명세 §2.1 / FR-10.1: 새 대화 생성 시 사용할 모델 선택.
  const [selectedModel, setSelectedModel] = useState<LlmModel>(
    () => readSettings().defaultLlmModel,
  );
  const selectedLlm = useMemo(
    () =>
      LLM_OPTIONS.find(o => o.model === selectedModel) ?? DEFAULT_LLM_OPTION,
    [selectedModel],
  );

  const { size: sidebarWidth, onMouseDown: onSidebarResize } = useResizeDrag(240, 'x', 160, 480);

  const { data: conversations = [], isLoading: convsLoading } = useConversations();
  const {
    data: history = [],
    isLoading: msgsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMessages(activeConvId);
  const onConversationCreated = useCallback(
    (newChatId: string) => navigate(chatPath(newChatId), { replace: true }),
    [navigate],
  );
  const {
    sendMessage,
    cancel,
    isPending: isSending,
    isCanceling,
    liveMessages: sendLiveMessages,
  } = useSendMessage(activeConvId, {
    onConversationCreated,
    chatOptions: {
      llmProvider: selectedLlm.provider,
      llmModel: selectedLlm.model,
    },
  });
  const {
    regenerate,
    liveMessages: regenerateLiveMessages = [],
  } = useRegenerate(activeConvId);
  const {
    editMessage,
    liveMessages: editLiveMessages = [],
  } = useEditMessage(activeConvId);

  const { chatMeta, chatMetaLoading, activeConv } = useActiveConversation(
    conversations,
    activeConvId,
  );

  const {
    graphRootId,
    activeBranch,
    parentMessages,
    parentMsgsLoading,
    activeBranchMarkerLabel,
  } = useBranchContext({
    conversations,
    activeConvId,
    optimisticBranch,
    chatMeta,
    activeConv,
  });

  const { messages, visibleMessages } = useLiveMessageMerge({
    history,
    sendLiveMessages,
    regenerateLiveMessages,
    editLiveMessages,
    activeConvId,
    activeBranch,
    parentMessages,
  });

  const isMessagesLoading = msgsLoading || (!!activeBranch && parentMsgsLoading);

  const isNewChatEmpty =
    activeConvId === 'new' && !msgsLoading && messages.length === 0;

  // 명세 §2.4: 위로 스크롤 시 과거 턴 페이지를 잇는다.
  const handleLoadOlder = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isKnownConvId = useMemo(
    () =>
      activeConvId === 'new' ||
      (!!chatMeta && String(chatMeta.chatId) === activeConvId) ||
      conversations.some(
        c =>
          c.id === activeConvId ||
          c.branches.some(b => b.id === activeConvId),
      ),
    [conversations, activeConvId, chatMeta],
  );

  useEffect(() => {
    if (
      !convsLoading &&
      !chatMetaLoading &&
      conversations.length > 0 &&
      activeConvId !== 'new' &&
      !isKnownConvId
    ) {
      navigate(chatPath(conversations[0].id), { replace: true });
    }
  }, [convsLoading, chatMetaLoading, conversations, activeConvId, isKnownConvId, navigate]);

  const { createBranch } = useCreateBranch({
    onCreated: (result) => {
      setOptimisticBranch(result);
      setSidebarOpen(true);
    },
  });

  // 명세 §2.1: chatId 는 분기점 turn 이 실제로 속한 chat 의 id 여야 한다.
  // 부모 chat 의 메시지를 자식 분기에서 클릭한 경우 originChatId 를 써야 BRANCH_4001 방지.
  const handleBranch = useCallback((messageId: string, originChatId: string) => {
    const message = visibleMessages.messages.find(m => m.id === messageId);
    if (!message?.turnId) return;
    createBranch(message.turnId, originChatId);
  }, [visibleMessages.messages, createBranch]);

  // NFR-U-4: 전송 실패 시 사용자가 다시 칠 필요 없이 입력을 복구한다.
  const handleSend = useCallback(async () => {
    const content = input.trim();
    if (!content || isSending) return;
    setInput('');
    const ok = await sendMessage(content);
    if (!ok) setInput(content);
  }, [input, isSending, sendMessage]);

  // 명세 §4.1: 재생성 경로는 messageId 가 속한 chat 의 id 를 써야 한다.
  const handleRegenerate = useCallback((messageId: string, originChatId: string) => {
    const messageIndex = visibleMessages.messages.findIndex(message => message.id === messageId);
    const userMessage = [...visibleMessages.messages]
      .slice(0, Math.max(messageIndex, 0))
      .reverse()
      .find(message => message.role === 'user');

    regenerate(messageId, originChatId, userMessage?.content ?? '');
  }, [visibleMessages.messages, regenerate]);

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
          graphRootId={graphRootId}
          optimisticBranch={optimisticBranch}
        />

        {sidebarOpen && (
          <ResizeHandle direction="x" onMouseDown={onSidebarResize} />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          {isNewChatEmpty ? (
            <NewChatLanding
              userName={user?.name}
              input={input}
              onInputChange={setInput}
              onSend={handleSend}
              isSending={isSending}
              onCancel={cancel}
              isCanceling={isCanceling}
              selectedModel={selectedModel}
              onSelectModel={setSelectedModel}
            />
          ) : (
            <ConversationView
              conversationId={activeConvId}
              visibleMessages={visibleMessages}
              isMessagesLoading={isMessagesLoading}
              userName={user?.name ?? '나'}
              activeBranchMarkerLabel={activeBranchMarkerLabel}
              hasOlder={hasNextPage}
              isLoadingOlder={isFetchingNextPage}
              onLoadOlder={handleLoadOlder}
              onBranch={handleBranch}
              onRegenerate={handleRegenerate}
              onEdit={editMessage}
              targetTurnId={targetTurnId}
              onTargetTurnReached={handleTargetTurnReached}
              input={input}
              onInputChange={setInput}
              onSend={handleSend}
              isSending={isSending}
              onCancel={cancel}
              isCanceling={isCanceling}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatLayout;
