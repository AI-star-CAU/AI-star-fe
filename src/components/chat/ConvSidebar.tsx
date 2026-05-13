import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Conversation, Message } from '../../api/ait';
import GraphPanel, { type NodeAction } from './GraphPanel';
import GraphLegend from './GraphLegend';
import ResizeHandle from './ResizeHandle';
import { useBranchMessages } from '../../hooks/useBranchMessages';
import { useMessages } from '../../hooks/useMessages';
import { useResizeDrag } from '../../hooks/useResizeDrag';
import ConversationList from './ConversationList';

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
          />
        </div>
        <GraphLegend />
      </div>
    </aside>
  );
};

export default ConvSidebar;
