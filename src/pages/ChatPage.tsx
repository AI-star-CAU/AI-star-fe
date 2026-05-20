import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useConversations } from '../features/chat/hooks/useConversations';
import { useChatMeta } from '../features/chat/hooks/useChatMeta';
import { useMessages } from '../features/chat/hooks/useMessages';
import { useSendMessage } from '../features/chat/hooks/useSendMessage';
import { useRegenerate } from '../features/chat/hooks/useRegenerate';
import { useEditMessage } from '../features/chat/hooks/useEditMessage';
import { branchApi } from '../features/branch/api/branchApi';
import {
  getMessagesThroughFork,
  removePreTurnAssistantMessages,
} from '../features/chat/utils/messageHelpers';
import ChatHeader from '../features/chat/components/ChatHeader';
import ConvSidebar from '../features/chat/components/ConvSidebar';
import MessageList from '../features/chat/components/MessageList';
import ChatInput from '../features/chat/components/ChatInput';
import LlmModelSelect from '../features/chat/components/LlmModelSelect';
import { LLM_OPTIONS, DEFAULT_LLM_OPTION } from '../features/chat/constants/llm';
import type { LlmModel } from '../features/chat/types';
import ResizeHandle from '../shared/components/layout/ResizeHandle';
import { useResizeDrag } from '../shared/hooks/useResizeDrag';
import { chatPath } from '../app/router/routes';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { convId } = useParams<{ convId: string }>();
  const { user, logout } = useAuth();

  const [input, setInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // 명세 §2.1 / FR-10.1: 새 대화 생성 시 사용할 모델 선택.
  const [selectedModel, setSelectedModel] = useState<LlmModel>(
    DEFAULT_LLM_OPTION.model,
  );
  const selectedLlm = useMemo(
    () =>
      LLM_OPTIONS.find(o => o.model === selectedModel) ?? DEFAULT_LLM_OPTION,
    [selectedModel],
  );

  const { size: sidebarWidth, onMouseDown: onSidebarResize } = useResizeDrag(240, 'x', 160, 480);

  const activeConvId = convId ?? 'new';

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
    liveMessages,
  } = useSendMessage(activeConvId, {
    onConversationCreated,
    chatOptions: {
      llmProvider: selectedLlm.provider,
      llmModel: selectedLlm.model,
    },
  });
  const { regenerate } = useRegenerate(activeConvId);
  const { editMessage } = useEditMessage(activeConvId);

  const listConv = useMemo(
    () => conversations.find(c => c.id === activeConvId),
    [conversations, activeConvId],
  );
  // 명세 §2.3: 목록에 아직 없는(갓 생성된) chat 은 메타 조회로 보강.
  const { data: chatMeta } = useChatMeta(
    listConv || activeConvId === 'new' ? '' : activeConvId,
  );
  const activeConv = useMemo<typeof listConv>(() => {
    if (listConv) return listConv;
    if (!chatMeta) return undefined;
    return {
      id: String(chatMeta.chatId),
      title: chatMeta.title,
      preview: '아직 메시지가 없습니다.',
      createdAt: chatMeta.createdAt,
      turnCount: 0,
      lastMessageAt: null,
      llmProvider: chatMeta.llmProvider,
      llmModel: chatMeta.llmModel,
      branches: [],
    };
  }, [listConv, chatMeta]);
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
  // 히스토리(§2.4 무한스크롤) + 진행 중인 스트리밍 턴(liveMessages)을 합친다.
  // 'new' → /chat/{id} 직후 useMessages 가 진행 중 턴을 history 로 가져오면
  // liveMessages 와 중복으로 보이므로, turn_started 이후 매칭되는 id 는 제거한다.
  const messages = useMemo(() => {
    if (liveMessages.length === 0) return history;
    const liveIds = new Set(liveMessages.map(m => m.id));
    const dedupedHistory = history.filter(h => !liveIds.has(h.id));
    return [...dedupedHistory, ...liveMessages];
  }, [history, liveMessages]);
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

  const isNewChatEmpty =
    activeConvId === 'new' && !msgsLoading && messages.length === 0;

  // 명세 §2.4: 위로 스크롤 시 과거 턴 페이지를 잇는다.
  const handleLoadOlder = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isKnownConvId = useMemo(
    () =>
      conversations.some(
        c =>
          c.id === activeConvId ||
          c.branches.some(b => b.id === activeConvId),
      ),
    [conversations, activeConvId],
  );

  useEffect(() => {
    if (
      !convsLoading &&
      conversations.length > 0 &&
      activeConvId !== 'new' &&
      !isKnownConvId
    ) {
      navigate(chatPath(conversations[0].id), { replace: true });
    }
  }, [convsLoading, conversations, activeConvId, isKnownConvId, navigate]);

  const handleBranch = useCallback(async (messageId: string) => {
    const message = visibleMessages.messages.find(m => m.id === messageId);
    if (!message?.turnId) {
      console.warn('[handleBranch] turnId 없음 — 서버에서 아직 확정되지 않은 메시지:', messageId);
      return;
    }
    const numericChatId = Number(activeConvId);
    if (isNaN(numericChatId)) return;
    try {
      const result = await branchApi.createBranch(numericChatId, {
        branchPointTurnId: message.turnId,
      });
      navigate(chatPath(String(result.chatId)));
    } catch (err) {
      console.error('[handleBranch] 분기 생성 실패:', err);
      alert('분기 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }, [visibleMessages.messages, activeConvId, navigate]);

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
                <div className="mb-3 flex justify-center">
                  <LlmModelSelect
                    value={selectedModel}
                    onChange={setSelectedModel}
                    disabled={isSending}
                  />
                </div>
                <ChatInput
                  value={input}
                  onChange={setInput}
                  onSend={handleSend}
                  isSending={isSending}
                  onCancel={cancel}
                  isCanceling={isCanceling}
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
                hasOlder={hasNextPage && !activeBranch}
                isLoadingOlder={isFetchingNextPage}
                onLoadOlder={handleLoadOlder}
                onBranch={handleBranch}
                onRegenerate={regenerate}
                onEdit={editMessage}
              />
              <ChatInput
                value={input}
                onChange={setInput}
                onSend={handleSend}
                isSending={isSending}
                onCancel={cancel}
                isCanceling={isCanceling}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
