import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConversationList from './ConversationList';
import GraphPanel from '../../graph/components/GraphPanel';
import { branchApi } from '../../branch/api/branchApi';
import { graphApi } from '../../graph/api/graphApi';
import { useBranchMessages } from '../../branch/hooks/useBranchMessages';
import { useGraph } from '../../graph/hooks/useGraph';
import { useMessages } from '../../chat/hooks/useMessages';
import { useDeleteChat } from '../../chat/hooks/useDeleteChat';
import { useResizeDrag } from '../../../shared/hooks/useResizeDrag';
import ResizeHandle from '../../../shared/components/layout/ResizeHandle';
import type { Conversation, Message } from '../../chat/types';
import type { CreateBranchResponse } from '../../branch/types';
import type { GraphResponse, NodeAction } from '../../graph/types';

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

function mergeGraphSnapshots(
  previous: GraphResponse | undefined,
  next: GraphResponse,
): GraphResponse {
  if (!previous || previous.rootChatId !== next.rootChatId) {
    return next;
  }

  const chatsById = new Map(previous.chats.map(chat => [chat.chatId, chat]));
  next.chats.forEach(chat => chatsById.set(chat.chatId, chat));

  const turnsById = new Map(previous.turns.map(turn => [turn.turnId, turn]));
  next.turns.forEach(turn => turnsById.set(turn.turnId, turn));

  return {
    ...next,
    chats: [...chatsById.values()],
    turns: [...turnsById.values()],
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
  optimisticBranch,
}) => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>();
  const [graphZoom, setGraphZoom] = useState(1);

  const { size: convListHeight, onMouseDown: onVerticalDrag } = useResizeDrag(320, 'y', 180, 760);

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

  const graphRequestId = activeParentId;
  const numericChatId = graphRequestId ? Number(graphRequestId) : null;
  const validChatId = numericChatId !== null && !isNaN(numericChatId) ? numericChatId : null;
  const { data: baseGraphData, isFetching: isGraphFetching } = useGraph(
    validChatId,
    undefined,
    { up: 100, down: 100 },
  );
  const [mergedGraphData, setMergedGraphData] = React.useState<typeof baseGraphData>(undefined);

  React.useEffect(() => {
    if (!baseGraphData) {
      setMergedGraphData(undefined);
      return;
    }

    const nextGraphData = mergeOptimisticBranch(baseGraphData, optimisticBranch);
    setMergedGraphData(prev => mergeGraphSnapshots(prev, nextGraphData));
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
    const result = await graphApi.expandGraph(validChatId, { fromTurnId, direction });
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

      <div className="flex-1 min-h-[220px] overflow-hidden flex flex-col border-t border-slate-800">
        <div className="px-4 py-2 flex-shrink-0 flex items-center justify-between gap-2">
          <p className="section-label">분기 구조</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setGraphZoom(value => Math.max(0.6, Math.round((value - 0.1) * 10) / 10))}
              className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              aria-label="그래프 축소"
            >
              -
            </button>
            <span className="w-10 text-center text-[10px] font-semibold text-slate-500">
              {Math.round(graphZoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setGraphZoom(value => Math.min(1.8, Math.round((value + 0.1) * 10) / 10))}
              className="w-6 h-6 rounded-md bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
              aria-label="그래프 확대"
            >
              +
            </button>
          </div>
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
            zoom={graphZoom}
          />
        </div>
      </div>
    </aside>
  );
};

export default ConvSidebar;
