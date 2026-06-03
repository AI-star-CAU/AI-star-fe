import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConversationList from './ConversationList';
import GraphPanel from '../../graph/components/GraphPanel';
import { useOptimisticGraphMerge } from '../hooks/useOptimisticGraphMerge';
import { useBranchMessages } from '../../branch/hooks/useBranchMessages';
import { useMessages } from '../../chat/hooks/useMessages';
import { useDeleteChat } from '../../chat/hooks/useDeleteChat';
import { useResizeDrag } from '../../../shared/hooks/useResizeDrag';
import ResizeHandle from '../../../shared/components/layout/ResizeHandle';
import type { Conversation, Message } from '../../chat/types';
import type { CreateBranchResponse } from '../../branch/types';
import type { GraphViewMode, NodeAction } from '../../graph/types';

interface ConvSidebarProps {
  conversations: Conversation[];
  isLoading: boolean;
  activeId: string;
  messages: Message[];
  conv: Conversation | undefined;
  isOpen: boolean;
  width: number;
  graphRootId?: string | null;
  optimisticBranch?: CreateBranchResponse | null;
}

const ConvSidebar: React.FC<ConvSidebarProps> = ({
  conversations,
  isLoading,
  activeId,
  messages,
  conv,
  isOpen,
  width,
  graphRootId,
  optimisticBranch,
}) => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>();
  const [graphZoom, setGraphZoom] = useState(1);
  const [graphViewMode, setGraphViewMode] = useState<GraphViewMode>('structure');

  const { size: convListHeight, onMouseDown: onVerticalDrag } = useResizeDrag(320, 'y', 180, 760);

  const activeParentIdFromList = useMemo(
    () => conversations.find(conversation =>
      conversation.id === activeId || conversation.branches.some(branch => branch.id === activeId)
    )?.id ?? null,
    [activeId, conversations],
  );
  const activeParentId = activeParentIdFromList ?? graphRootId ?? null;
  const visibleExpandedId = expandedId === undefined ? activeParentId : expandedId;
  const graphConversation = useMemo(
    () => conversations.find(conversation => conversation.id === activeParentId),
    [activeParentId, conversations],
  );
  const { data: rootMessages = [] } = useMessages(activeParentId ?? '');
  const rootMessagesSource = activeId === graphConversation?.id ? messages : rootMessages;
  const optimisticForkTurnIndex = useMemo(() => {
    if (!optimisticBranch) return 1;

    const userTurns = rootMessagesSource.filter(
      message => !message.isPending && message.role === 'user',
    );
    const index = userTurns.findIndex(
      message => message.turnId === optimisticBranch.branchPointTurnId,
    );

    return index >= 0 ? index + 1 : Math.max(1, userTurns.length);
  }, [rootMessagesSource, optimisticBranch]);
  const graphConversationWithOptimisticBranch = useMemo(() => {
    if (
      !graphConversation ||
      !optimisticBranch ||
      String(optimisticBranch.rootChatId) !== activeParentId ||
      graphConversation.branches.some(branch => branch.id === String(optimisticBranch.chatId))
    ) {
      return graphConversation;
    }

    return {
      ...graphConversation,
      branches: [
        ...graphConversation.branches,
        {
          id: String(optimisticBranch.chatId),
          parentConvId: String(optimisticBranch.parentId),
          title: optimisticBranch.title ?? '제목없음',
          forkAtTurnIndex: optimisticForkTurnIndex,
          branchPointTurnId: optimisticBranch.branchPointTurnId,
          depth: (graphConversation.branches.find(
            branch => branch.id === String(optimisticBranch.parentId),
          )?.depth ?? 0) + 1,
        },
      ],
    };
  }, [graphConversation, optimisticBranch, activeParentId, optimisticForkTurnIndex]);
  const branchIds = useMemo(() => {
    const ids = graphConversationWithOptimisticBranch?.branches.map(branch => branch.id) ?? [];
    if (
      optimisticBranch &&
      String(optimisticBranch.rootChatId) === activeParentId &&
      !ids.includes(String(optimisticBranch.chatId))
    ) {
      return [...ids, String(optimisticBranch.chatId)];
    }
    return ids;
  }, [graphConversationWithOptimisticBranch, optimisticBranch, activeParentId]);
  const branchMessagesById = useBranchMessages(branchIds);
  const graphMessages = activeId === graphConversationWithOptimisticBranch?.id ? messages : rootMessages;

  const { mutate: deleteChat } = useDeleteChat();

  const handleDeleteConversation = useCallback(
    (conversationId: string) => {
      const target = conversations.find(c => c.id === conversationId);
      const label = target ? `"${target.title}"` : '이 대화';
      if (!window.confirm(`${label}를 삭제할까요? 되돌릴 수 없습니다.`)) {
        return;
      }
      deleteChat(Number(conversationId), {
        onSuccess: () => {
          if (conversationId === activeId) navigate('/chat/new');
        },
      });
    },
    [conversations, deleteChat, activeId, navigate],
  );

  // Graph API는 path chatId를 기준으로 center turn을 고른다.
  // 브랜치 화면에서는 root가 아니라 현재 branch id로 조회해야 해당 분기 경로가 보인다.
  const graphRequestId = activeId === 'new' ? activeParentId : activeId;
  const numericGraphChatId = graphRequestId ? Number(graphRequestId) : null;
  const validGraphChatId =
    numericGraphChatId !== null && !isNaN(numericGraphChatId) ? numericGraphChatId : null;
  const {
    mergedGraphData,
    isGraphFetching,
    handleExpand,
    graphErrorMessage,
  } = useOptimisticGraphMerge(validGraphChatId, optimisticBranch);

  const handleCreateConversation = useCallback(() => {
    navigate('/chat/new');
  }, [navigate]);

  const handleSelectConversation = useCallback((conversationId: string) => {
    navigate(`/chat/${conversationId}`);
    setExpandedId(currentId => {
      const currentExpandedId = currentId === undefined ? activeParentId : currentId;
      return currentExpandedId === conversationId ? null : conversationId;
    });
  }, [activeParentId, navigate]);

  const handleSelectBranch = useCallback((branchId: string) => {
    const parent = conversations.find(conversation =>
      conversation.branches.some(branch => branch.id === branchId)
    );

    if (parent) setExpandedId(parent.id);
    navigate(`/chat/${branchId}`);
  }, [conversations, navigate]);

  const handleNodeClick = useCallback((action: NodeAction) => {
    if (action.type === 'turn') {
      navigate(`/chat/${action.chatId}?turnId=${action.turnId}`);
    } else {
      navigate(`/chat/${action.chatId}`);
    }
  }, [navigate]);

  return (
    <aside
      className="bg-ui-surface-muted border-r border-ui-line flex flex-col flex-shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out"
      style={{ width: isOpen ? width : 0 }}
    >
      <ConversationList
        conversations={conversations}
        isLoading={isLoading}
        activeId={activeId}
        expandedId={visibleExpandedId}
        height={convListHeight}
        onCreateConversation={handleCreateConversation}
        onSelectConversation={handleSelectConversation}
        onSelectBranch={handleSelectBranch}
        onDeleteConversation={handleDeleteConversation}
      />

      <ResizeHandle direction="y" onMouseDown={onVerticalDrag} />

      <div className="flex-1 min-h-[220px] overflow-hidden flex flex-col border-t border-ui-line">
        <div className="px-4 py-2 flex-shrink-0 flex items-center justify-between gap-2">
          <p className="section-label">분기 구조</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setGraphZoom(value => Math.max(0.6, Math.round((value - 0.1) * 10) / 10))}
              className="w-6 h-6 rounded-md bg-ui-surface-subtle text-ui-text-muted hover:bg-ui-surface-strong hover:text-ui-text transition-colors"
              aria-label="그래프 축소"
            >
              -
            </button>
            <span className="w-10 text-center text-[10px] font-semibold text-ui-text-faint">
              {Math.round(graphZoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setGraphZoom(value => Math.min(1.8, Math.round((value + 0.1) * 10) / 10))}
              className="w-6 h-6 rounded-md bg-ui-surface-subtle text-ui-text-muted hover:bg-ui-surface-strong hover:text-ui-text transition-colors"
              aria-label="그래프 확대"
            >
              +
            </button>
          </div>
        </div>
        <div className="px-4 pb-2 flex-shrink-0">
          <div className="grid grid-cols-2 overflow-hidden rounded-md border border-ui-line bg-ui-surface">
            <button
              type="button"
              onClick={() => setGraphViewMode('focused')}
              className={`h-7 text-[10px] font-semibold transition-colors ${
                graphViewMode === 'focused'
                  ? 'bg-ui-accent-muted/20 text-ui-accent'
                  : 'text-ui-text-faint hover:bg-ui-surface-subtle/60 hover:text-ui-text-muted'
              }`}
              aria-pressed={graphViewMode === 'focused'}
            >
              대화 보기
            </button>
            <button
              type="button"
              onClick={() => setGraphViewMode('structure')}
              className={`h-7 text-[10px] font-semibold transition-colors ${
                graphViewMode === 'structure'
                  ? 'bg-ui-accent-muted/20 text-ui-accent'
                  : 'text-ui-text-faint hover:bg-ui-surface-subtle/60 hover:text-ui-text-muted'
              }`}
              aria-pressed={graphViewMode === 'structure'}
            >
              구조 보기
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto px-4 pb-3">
          {graphErrorMessage && (
            <div
              role="alert"
              className="mb-2 rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-[11px] leading-4 text-rose-200"
            >
              {graphErrorMessage}
            </div>
          )}
          <GraphPanel
            messages={graphMessages}
            conv={graphConversationWithOptimisticBranch ?? conv}
            branchMessagesById={branchMessagesById}
            activeId={activeId}
            onNodeClick={handleNodeClick}
            graphData={isGraphFetching && !mergedGraphData ? undefined : mergedGraphData}
            onExpand={handleExpand}
            zoom={graphZoom}
            viewMode={graphViewMode}
          />
        </div>
      </div>
    </aside>
  );
};

export default ConvSidebar;
