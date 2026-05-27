import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useConversations } from '../../features/conversation-explorer/hooks/useConversations';
import { useChatMeta } from '../../features/chat/hooks/useChatMeta';
import { useMessages } from '../../features/chat/hooks/useMessages';
import { useSendMessage } from '../../features/chat/hooks/useSendMessage';
import { useRegenerate } from '../../features/chat/hooks/useRegenerate';
import { useEditMessage } from '../../features/chat/hooks/useEditMessage';
import { useCreateBranch } from '../../features/branch/hooks/useCreateBranch';
import { useGraph } from '../../features/graph/hooks/useGraph';
import {
  getForkTurnIndexByTurnId,
  getMessagesThroughFork,
  removePreTurnAssistantMessages,
} from '../../features/chat/utils/messageHelpers';
import ChatHeader from '../../features/chat/components/ChatHeader';
import ConvSidebar from '../../features/conversation-explorer/components/ConvSidebar';
import { LLM_OPTIONS, DEFAULT_LLM_OPTION } from '../../features/chat/constants/llm';
import type { LlmModel } from '../../features/chat/types';
import ResizeHandle from '../../shared/components/layout/ResizeHandle';
import { useResizeDrag } from '../../shared/hooks/useResizeDrag';
import { chatPath } from '../../app/router/routes';
import { readSettings } from '../../features/settings/utils/settingsStorage';
import type { Branch, CreateBranchResponse } from '../../features/branch/types';
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
 */
const ChatLayout: React.FC = () => {
  const navigate = useNavigate();
  const { convId } = useParams<{ convId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();

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

  const activeConvId = convId ?? 'new';
  const targetTurnId = useMemo(() => {
    const raw = searchParams.get('turnId');
    if (!raw) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  }, [searchParams]);

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

  const listConv = useMemo(
    () => conversations.find(c => c.id === activeConvId),
    [conversations, activeConvId],
  );
  // 명세 §2.3: 목록에 아직 없는(갓 생성된) chat 은 메타 조회로 보강.
  const { data: chatMeta, isLoading: chatMetaLoading } = useChatMeta(
    activeConvId === 'new' ? '' : activeConvId,
  );
  const activeConv = useMemo<typeof listConv>(() => {
    if (listConv) return listConv;
    if (!chatMeta) return undefined;
    return {
      id: String(chatMeta.chatId),
      title: chatMeta.title ?? '제목없음',
      preview: '아직 메시지가 없습니다.',
      createdAt: chatMeta.createdAt,
      turnCount: 0,
      lastMessageAt: null,
      llmProvider: chatMeta.llmProvider,
      llmModel: chatMeta.llmModel,
      branches: [],
    };
  }, [listConv, chatMeta]);
  const graphRootId = useMemo(() => {
    if (activeConvId === 'new') return null;
    if (optimisticBranch && String(optimisticBranch.chatId) === activeConvId) {
      return String(optimisticBranch.rootChatId);
    }
    if (
      chatMeta &&
      String(chatMeta.chatId) === activeConvId &&
      chatMeta.rootChatId != null
    ) {
      return String(chatMeta.rootChatId);
    }
    return activeConvId;
  }, [activeConvId, optimisticBranch, chatMeta]);
  const listedActiveBranch = useMemo(
    () => conversations.flatMap(c => c.branches).find(branch => branch.id === activeConvId),
    [conversations, activeConvId],
  );
  const metaBranchParentId = useMemo(() => {
    if (listedActiveBranch) return listedActiveBranch.parentConvId;
    if (optimisticBranch && String(optimisticBranch.chatId) === activeConvId) {
      return String(optimisticBranch.parentId);
    }
    if (
      chatMeta &&
      String(chatMeta.chatId) === activeConvId &&
      chatMeta.parentId != null
    ) {
      return String(chatMeta.parentId);
    }
    return null;
  }, [listedActiveBranch, optimisticBranch, activeConvId, chatMeta]);
  const metaBranchPointTurnId = useMemo(() => {
    if (optimisticBranch && String(optimisticBranch.chatId) === activeConvId) {
      return optimisticBranch.branchPointTurnId;
    }
    // Phase 4 §2.1: 탐색기에서 내려온 분기 노드는 branchPointTurnId 를 갖는다.
    if (listedActiveBranch?.branchPointTurnId != null) {
      return listedActiveBranch.branchPointTurnId;
    }
    if (
      chatMeta &&
      String(chatMeta.chatId) === activeConvId &&
      chatMeta.branchPointTurnId != null
    ) {
      return chatMeta.branchPointTurnId;
    }
    return null;
  }, [optimisticBranch, activeConvId, chatMeta, listedActiveBranch]);
  const { data: parentMessages = [], isLoading: parentMsgsLoading } = useMessages(
    metaBranchParentId ?? '',
  );
  const activeBranch = useMemo<Branch | undefined>(() => {
    // Phase 4 §2.1: 탐색기에서 온 분기는 turn 인덱스를 모르므로(forkAtTurnIndex=0)
    // branchPointTurnId + 부모 메시지로 정확한 fork 위치를 항상 재계산한다.
    if (!metaBranchParentId || metaBranchPointTurnId == null) {
      return listedActiveBranch ?? undefined;
    }

    const parentForkIndex =
      getForkTurnIndexByTurnId(
        removePreTurnAssistantMessages(parentMessages),
        metaBranchPointTurnId,
      ) ?? 1;

    return {
      id: activeConvId,
      parentConvId: metaBranchParentId,
      title: listedActiveBranch?.title ?? activeConv?.title ?? '제목없음',
      forkAtTurnIndex: parentForkIndex,
      depth: listedActiveBranch?.depth,
      branchPointTurnId: metaBranchPointTurnId,
    };
  }, [
    listedActiveBranch,
    metaBranchParentId,
    metaBranchPointTurnId,
    parentMessages,
    activeConvId,
    activeConv,
  ]);
  const activeParentConv = useMemo(
    () => conversations.find(conversation => conversation.id === activeBranch?.parentConvId),
    [activeBranch, conversations],
  );
  const activeBranchNumber = useMemo(
    () => {
      if (!activeBranch) return null;
      if (!activeParentConv) return 1;
      const index = activeParentConv.branches.findIndex(branch => branch.id === activeBranch.id);
      return index >= 0 ? index + 1 : 1;
    },
    [activeBranch, activeParentConv],
  );
  // GraphPanel 과 동일한 정렬(depth ASC, chatId ASC)로 B{n} 컬럼을 매긴다.
  // useGraph 캐시 키가 동일하면 ConvSidebar 와 fetch 를 공유한다.
  const graphChatIdNum = useMemo(() => {
    if (activeConvId === 'new') return null;
    const n = Number(activeConvId);
    return Number.isFinite(n) ? n : null;
  }, [activeConvId]);
  const { data: branchLabelGraphData } = useGraph(graphChatIdNum);
  const activeBranchMarkerLabel = useMemo(() => {
    if (!activeBranch) return undefined;
    const chats = branchLabelGraphData?.chats;
    if (chats && chats.length > 0) {
      const sorted = [...chats].sort((a, b) => a.depth - b.depth || a.chatId - b.chatId);
      const rootChat = sorted.find(c => c.parentChatId === null);
      if (rootChat) {
        let col = 0;
        for (const chat of sorted) {
          if (chat.chatId === rootChat.chatId) continue;
          col += 1;
          if (String(chat.chatId) === activeBranch.id) return `B${col}`;
        }
      }
    }
    return activeBranchNumber ? `B${activeBranchNumber}` : 'B1';
  }, [activeBranch, activeBranchNumber, branchLabelGraphData]);
  // 히스토리(§2.4 무한스크롤) + 진행 중인 스트리밍 턴(liveMessages)을 합친다.
  // 'new' → /chat/{id} 직후 useMessages 가 진행 중 턴을 history 로 가져오면
  // liveMessages 와 중복으로 보이므로, turn_started 이후 매칭되는 id 는 제거한다.
  const messages = useMemo(() => {
    const liveMessages = [
      ...sendLiveMessages,
      ...regenerateLiveMessages,
      ...editLiveMessages,
    ].filter(message => message.conversationId === activeConvId);
    if (liveMessages.length === 0) return history;
    const liveIds = new Set(liveMessages.map(m => m.id));
    const dedupedHistory = history.filter(h => !liveIds.has(h.id));
    return [...dedupedHistory, ...liveMessages];
  }, [history, sendLiveMessages, regenerateLiveMessages, editLiveMessages, activeConvId]);
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

  const handleTargetTurnReached = useCallback(() => {
    setSearchParams(current => {
      const next = new URLSearchParams(current);
      next.delete('turnId');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

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
