import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConversationList from './ConversationList';
import GraphPanel from '../../branch/components/GraphPanel';
import { branchApi } from '../../branch/api/branchApi';
import { useBranchMessages } from '../../branch/hooks/useBranchMessages';
import { useGraph } from '../../branch/hooks/useGraph';
import { useMessages } from '../hooks/useMessages';
import { useDeleteChat } from '../hooks/useDeleteChat';
import { useResizeDrag } from '../../../shared/hooks/useResizeDrag';
import ResizeHandle from '../../../shared/components/layout/ResizeHandle';
import type { Conversation, Message } from '../types';
import type { CreateBranchResponse, GraphResponse, NodeAction } from '../../branch/types';

interface ConvSidebarProps {
  conversations: Conversation[];
  isLoading: boolean;
  activeId: string;
  messages: Message[];
  conv: Conversation | undefined;
  isOpen: boolean;
  width: number;
  graphRootId?: string | null;
  graphQueryId?: string | null;
  optimisticBranch?: CreateBranchResponse | null;
}

function mergeOptimisticBranch(
  graphData: GraphResponse,
  optimisticBranch?: CreateBranchResponse | null,
): GraphResponse {
  if (
    !optimisticBranch ||
    graphData.rootChatId !== optimisticBranch.rootChatId ||
    graphData.chats.some(chat => chat.chatId === optimisticBranch.chatId)
  ) {
    return graphData;
  }

  const parentChat = graphData.chats.find(
    chat => chat.chatId === optimisticBranch.parentId,
  );

  return {
    ...graphData,
    chats: [
      ...graphData.chats,
      {
        chatId: optimisticBranch.chatId,
        title: optimisticBranch.title ?? '제목없음',
        titleStatus: optimisticBranch.titleStatus,
        parentChatId: optimisticBranch.parentId,
        branchPointTurnId: optimisticBranch.branchPointTurnId,
        depth: (parentChat?.depth ?? 0) + 1,
        isDeleted: false,
        lastTurnId: null,
        updatedAt: optimisticBranch.updatedAt,
      },
    ],
    turns: graphData.turns.map(turn =>
      turn.turnId === optimisticBranch.branchPointTurnId
        ? { ...turn, isBranchPoint: true }
        : turn,
    ),
  };
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
  graphQueryId,
  optimisticBranch,
}) => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>();
  const [graphCenterTurnId, setGraphCenterTurnId] = useState<number | undefined>();

  const { size: convListHeight, onMouseDown: onVerticalDrag } = useResizeDrag(240, 'y', 80, 520);

  const activeParentIdFromList = useMemo(
    () => conversations.find(conversation =>
      conversation.id === activeId || conversation.branches.some(branch => branch.id === activeId)
    )?.id ?? null,
    [activeId, conversations],
  );
  const activeParentId = graphRootId ?? activeParentIdFromList;
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

  const graphRequestId = graphQueryId ?? activeParentId;
  const numericChatId = graphRequestId ? Number(graphRequestId) : null;
  const validChatId = numericChatId !== null && !isNaN(numericChatId) ? numericChatId : null;
  const { data: baseGraphData, isFetching: isGraphFetching } = useGraph(
    validChatId,
    graphCenterTurnId,
  );
  const [mergedGraphData, setMergedGraphData] = React.useState<typeof baseGraphData>(undefined);

  React.useEffect(() => {
    if (!baseGraphData) {
      setMergedGraphData(undefined);
      return;
    }

    setMergedGraphData(mergeOptimisticBranch(baseGraphData, optimisticBranch));
  }, [baseGraphData, optimisticBranch]);

  const handleRestore = useCallback(async (chatId: string) => {
    const numericId = Number(chatId);
    if (isNaN(numericId)) return;
    await branchApi.restoreBranch(numericId);
    if (validChatId) {
      setMergedGraphData(undefined);
    }
  }, [validChatId]);

  const handleExpand = useCallback(async (fromTurnId: number, direction: 'UP' | 'DOWN') => {
    if (!validChatId) return;
    const result = await branchApi.expandGraph(validChatId, { fromTurnId, direction });
    setMergedGraphData(prev => {
      if (!prev) return prev;
      const existingIds = new Set(prev.turns.map(t => t.turnId));
      const newTurns = result.turns.filter(t => !existingIds.has(t.turnId));
      const updatedFrontier = {
        up: direction === 'UP' ? result.frontier.up : prev.frontier.up,
        down: direction === 'DOWN' ? result.frontier.down : prev.frontier.down,
      };
      return { ...prev, turns: [...prev.turns, ...newTurns], frontier: updatedFrontier };
    });
  }, [validChatId]);

  const handleCreateConversation = useCallback(() => {
    setGraphCenterTurnId(undefined);
    navigate('/chat/new');
  }, [navigate]);

  const handleSelectConversation = useCallback((conversationId: string) => {
    setGraphCenterTurnId(undefined);
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
    setGraphCenterTurnId(undefined);
    navigate(`/chat/${branchId}`);
  }, [conversations, navigate]);

  const handleNodeClick = useCallback((action: NodeAction) => {
    if (action.type === 'turn') {
      setGraphCenterTurnId(action.turnId);
      navigate(`/chat/${action.chatId}?turnId=${action.turnId}`);
    } else {
      setGraphCenterTurnId(undefined);
      navigate(`/chat/${action.chatId}`);
    }
  }, [navigate]);

  return (
    <aside
      className="bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out"
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

      <div className="flex-1 overflow-hidden flex flex-col border-t border-slate-800">
        <div className="px-4 py-2 flex-shrink-0">
          <p className="section-label">분기 구조</p>
        </div>
        <div className="flex-1 overflow-auto px-4 pb-3">
          <GraphPanel
            messages={graphMessages}
            conv={graphConversationWithOptimisticBranch ?? conv}
            branchMessagesById={branchMessagesById}
            activeId={activeId}
            onNodeClick={handleNodeClick}
            graphData={isGraphFetching && !mergedGraphData ? undefined : mergedGraphData}
            onExpand={handleExpand}
            onRestore={handleRestore}
          />
        </div>
      </div>
    </aside>
  );
};

export default ConvSidebar;
