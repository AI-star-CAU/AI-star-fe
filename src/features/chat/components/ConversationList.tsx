import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../../../shared/components/ui/Button';
import { branchApi } from '../../branch/api/branchApi';
import type { Branch } from '../../branch/types';
import type { Conversation } from '../types';

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

const BranchRow: React.FC<BranchRowProps> = ({ branch, isActive, onSelect }) => {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [title, setTitle] = useState(branch.title);
  const queryClient = useQueryClient();

  const handleRename = async () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === branch.title) {
      setTitle(branch.title);
      setEditing(false);
      return;
    }
    try {
      await branchApi.updateBranch(Number(branch.id), { title: trimmed });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch {
      setTitle(branch.title);
    }
    setEditing(false);
  };

  const handleDelete = async () => {
    try {
      await branchApi.deleteBranch(Number(branch.id));
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    } catch {
      setConfirming(false);
    }
  };

  return (
    <div className={`flex items-center gap-1 px-2 py-1.5 rounded-lg group ${
      isActive ? 'bg-amber-500/15 text-amber-300' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
    }`}>
      <svg className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>

      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={e => {
            if (e.key === 'Enter') handleRename();
            if (e.key === 'Escape') { setTitle(branch.title); setEditing(false); }
          }}
          className="flex-1 min-w-0 text-xs bg-slate-700 text-slate-100 rounded px-1 outline-none"
          maxLength={100}
        />
      ) : (
        <button
          type="button"
          onClick={() => onSelect(branch.id)}
          className="flex-1 min-w-0 text-left"
        >
          <span className="text-xs truncate block">{title}</span>
        </button>
      )}

      {!editing && !confirming && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); setEditing(true); }}
          className="opacity-0 group-hover:opacity-100 transition p-0.5 rounded hover:text-slate-200 flex-shrink-0"
          aria-label="제목 수정"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}

      {!editing && !confirming && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); setConfirming(true); }}
          className="opacity-0 group-hover:opacity-100 transition p-0.5 rounded hover:text-red-400 flex-shrink-0"
          aria-label="분기 삭제"
        >
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}

      {confirming && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); handleDelete(); }}
            className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40"
          >
            삭제
          </button>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); setConfirming(false); }}
            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400 hover:bg-slate-600"
          >
            취소
          </button>
        </div>
      )}

      {!editing && !confirming && (
        <span className="text-[10px] text-slate-600 flex-shrink-0">T{branch.forkAtTurnIndex}</span>
      )}
    </div>
  );
};

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
