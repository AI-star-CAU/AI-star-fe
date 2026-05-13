import type React from 'react';
import type { Branch, Conversation } from '../../api/ait';
import Button from '../ui/Button';

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  activeId: string;
  expandedId: string | null;
  height: number;
  onCreateConversation: () => void;
  onSelectConversation: (conversationId: string) => void;
  onSelectBranch: (branchId: string) => void;
}

interface ConversationRowProps {
  conversation: Conversation;
  activeId: string;
  isExpanded: boolean;
  onSelectConversation: (conversationId: string) => void;
  onSelectBranch: (branchId: string) => void;
}

interface BranchRowProps {
  branch: Branch;
  isActive: boolean;
  onSelect: (branchId: string) => void;
}

const SKELETON_ROWS = [1, 2, 3];

const ConversationSkeleton: React.FC = () => (
  <div className="space-y-2 px-2">
    {SKELETON_ROWS.map(row => (
      <div key={row} className="h-12 bg-slate-800/50 rounded-xl animate-pulse" />
    ))}
  </div>
);

const BranchRow: React.FC<BranchRowProps> = ({ branch, isActive, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(branch.id)}
    className={`w-full px-2 py-1.5 rounded-lg cursor-pointer transition flex items-center gap-2 text-left ${
      isActive
        ? 'bg-amber-500/15 text-amber-300'
        : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
    }`}
  >
    <svg className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
    <span className="text-xs truncate">{branch.title}</span>
    <span className="ml-auto text-[10px] text-slate-600 flex-shrink-0">
      T{branch.forkAtTurnIndex}
    </span>
  </button>
);

const ConversationRow: React.FC<ConversationRowProps> = ({
  conversation,
  activeId,
  isExpanded,
  onSelectConversation,
  onSelectBranch,
}) => {
  const hasBranches = conversation.branches.length > 0;

  return (
    <div>
      <button
        type="button"
        onClick={() => onSelectConversation(conversation.id)}
        className={`w-full text-left ${activeId === conversation.id ? 'sidebar-item-active' : 'sidebar-item'}`}
      >
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">{conversation.title}</p>
            <p className="text-xs text-slate-600 truncate mt-0.5">{conversation.preview}</p>
          </div>
          {hasBranches && (
            <span className="text-slate-600 text-xs mt-0.5 flex-shrink-0">
              {isExpanded ? '▾' : '▸'}
            </span>
          )}
        </div>
      </button>

      {hasBranches && isExpanded && (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-slate-700/60 pl-2">
          {conversation.branches.map(branch => (
            <BranchRow
              key={branch.id}
              branch={branch}
              isActive={activeId === branch.id}
              onSelect={onSelectBranch}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  isLoading,
  activeId,
  expandedId,
  height,
  onCreateConversation,
  onSelectConversation,
  onSelectBranch,
}) => (
  <>
    <div className="p-3 flex-shrink-0">
      <Button onClick={onCreateConversation} variant="primary" fullWidth>
        <span className="text-lg leading-none">+</span> 새 채팅
      </Button>
    </div>

    <div
      className="overflow-y-auto flex-shrink-0 px-2 pb-3"
      style={{ height }}
    >
      <p className="section-label px-2 py-1.5">최근 대화</p>

      {isLoading ? (
        <ConversationSkeleton />
      ) : conversations.length === 0 ? (
        <p className="text-xs text-slate-600 px-3 py-4 text-center">대화가 없습니다</p>
      ) : (
        conversations.map(conversation => (
          <ConversationRow
            key={conversation.id}
            conversation={conversation}
            activeId={activeId}
            isExpanded={expandedId === conversation.id}
            onSelectConversation={onSelectConversation}
            onSelectBranch={onSelectBranch}
          />
        ))
      )}
    </div>
  </>
);

export default ConversationList;
