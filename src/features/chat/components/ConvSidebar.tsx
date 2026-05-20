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
import type { NodeAction } from '../../branch/types';

interface ConvSidebarProps {
  conversations: Conversation[];
  isLoading: boolean;
  activeId: string;
  messages: Message[];
  conv: Conversation | undefined;
  isOpen: boolean;
  width: number;
}

const ConvSidebar: React.FC<ConvSidebarProps> = ({
  conversations,
  isLoading,
  activeId,
  messages,
  conv,
  isOpen,
  width,
}) => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<string | null>();

  const { size: convListHeight, onMouseDown: onVerticalDrag } = useResizeDrag(240, 'y', 80, 520);

  const activeParentId = useMemo(
    () => conversations.find(conversation =>
      conversation.id === activeId || conversation.branches.some(branch => branch.id === activeId)
    )?.id ?? null,
    [activeId, conversations],
  );
  const visibleExpandedId = expandedId === undefined ? activeParentId : expandedId;
  const graphConversation = useMemo(
    () => conversations.find(conversation => conversation.id === activeParentId),
    [activeParentId, conversations],
  );
  const branchIds = useMemo(
    () => graphConversation?.branches.map(branch => branch.id) ?? [],
    [graphConversation],
  );
  const { data: rootMessages = [] } = useMessages(graphConversation?.id ?? '');
  const branchMessagesById = useBranchMessages(branchIds);
  const graphMessages = activeId === graphConversation?.id ? messages : rootMessages;

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

  const numericChatId = graphConversation ? Number(graphConversation.id) : null;
  const validChatId = numericChatId !== null && !isNaN(numericChatId) ? numericChatId : null;
  const { data: baseGraphData, isFetching: isGraphFetching } = useGraph(validChatId);
  const [mergedGraphData, setMergedGraphData] = React.useState<typeof baseGraphData>(undefined);

  React.useEffect(() => {
    setMergedGraphData(baseGraphData);
  }, [baseGraphData]);

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
    if (action.type === 'scroll') {
      const target = document.getElementById(`msg-${action.messageId}`);

      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (action.chatId) {
        navigate(`/chat/${action.chatId}`);
      }
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

      <div className="flex-1 overflow-hidden flex flex-col border-t border-slate-800">
        <div className="px-4 py-2 flex-shrink-0">
          <p className="section-label">분기 구조</p>
        </div>
        <div className="flex-1 overflow-auto px-4 pb-3">
          <GraphPanel
            messages={graphMessages}
            conv={graphConversation ?? conv}
            branchMessagesById={branchMessagesById}
            activeId={activeId}
            onNodeClick={handleNodeClick}
            graphData={isGraphFetching ? undefined : mergedGraphData}
            onExpand={handleExpand}
            onRestore={handleRestore}
          />
        </div>
      </div>
    </aside>
  );
};

export default ConvSidebar;
