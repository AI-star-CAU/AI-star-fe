import React, { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Button from '../../../shared/components/ui/Button';
import SearchPanel from '../../search/components/SearchPanel';
import { branchApi } from '../../branch/api/branchApi';
import type { Branch } from '../../branch/types';
import type { Conversation } from '../../chat/types';

interface ConversationListProps {
  conversations: Conversation[];
  isLoading: boolean;
  activeId: string;
  expandedId: string | null;
  height: number;
  onCreateConversation: () => void;
  onSelectConversation: (conversationId: string) => void;
  onSelectBranch: (branchId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
}

interface ConversationRowProps {
  conversation: Conversation;
  activeId: string;
  isExpanded: boolean;
  onSelectConversation: (conversationId: string) => void;
  onSelectBranch: (branchId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
}

interface BranchRowProps {
  branch: Branch;
  isActive: boolean;
  hasChildren: boolean;
  isCollapsed: boolean;
  onToggleCollapse: (branchId: string) => void;
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

/**
 * 파일 탐색기형 펼침 삼각형. 닫힘=오른쪽(▶), 열림=아래(▼)로 회전한다.
 * (FG-4: 대화 기록을 파일 탐색기처럼 표현)
 */
const DisclosureTriangle: React.FC<{ open: boolean; className?: string }> = ({
  open,
  className = '',
}) => (
  <svg
    className={`w-3 h-3 transition-transform duration-150 ${open ? 'rotate-90' : ''} ${className}`}
    viewBox="0 0 12 12"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M4 2.5l4 3.5-4 3.5z" />
  </svg>
);

const BranchRow: React.FC<BranchRowProps> = ({
  branch,
  isActive,
  hasChildren,
  isCollapsed,
  onToggleCollapse,
  onSelect,
}) => {
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

  // Phase 4 §2.1: 손자 분기(depth ≥ 2)는 들여쓰기로 트리 깊이를 표현한다.
  const indent = Math.max(0, (branch.depth ?? 1) - 1) * 12;

  return (
    <div
      className={`flex items-center gap-1 px-2 py-1.5 rounded-lg group ${
        isActive ? 'bg-amber-500/15 text-amber-300' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
      }`}
      style={indent ? { marginLeft: indent } : undefined}
    >
      {hasChildren ? (
        // 하위 분기가 있는 분기: 회전하는 삼각형으로 접기/펼치기
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onToggleCollapse(branch.id); }}
          className="flex-shrink-0 p-0.5 -ml-0.5 text-amber-500 hover:text-amber-300"
          aria-label={isCollapsed ? '하위 분기 펼치기' : '하위 분기 접기'}
        >
          <DisclosureTriangle open={!isCollapsed} />
        </button>
      ) : (
        // 말단 분기: 작은 삼각형 마커(문서 아이콘 대체)
        <span className="flex-shrink-0 w-4 flex justify-center text-amber-500/60" aria-hidden="true">
          <DisclosureTriangle open={false} />
        </span>
      )}

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

      {!editing && !confirming && branch.forkAtTurnIndex > 0 && (
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
  onDeleteConversation,
}) => {
  const hasBranches = conversation.branches.length > 0;

  // 파일 트리: 개별 분기 하위를 접을 수 있도록 접힌 분기 id 를 보관한다.
  const [collapsedBranchIds, setCollapsedBranchIds] = useState<Set<string>>(
    () => new Set(),
  );
  const toggleBranchCollapse = (branchId: string) =>
    setCollapsedBranchIds(prev => {
      const next = new Set(prev);
      if (next.has(branchId)) next.delete(branchId);
      else next.add(branchId);
      return next;
    });

  const branchById = useMemo(
    () => new Map(conversation.branches.map(b => [b.id, b])),
    [conversation.branches],
  );
  // 하위 분기를 가진 분기 id (= 부모로 등장하는 id) 집합.
  const parentBranchIds = useMemo(
    () => new Set(conversation.branches.map(b => b.parentConvId)),
    [conversation.branches],
  );
  // 접힌 조상 분기를 가진 분기는 숨긴다.
  const visibleBranches = useMemo(() => {
    if (collapsedBranchIds.size === 0) return conversation.branches;
    return conversation.branches.filter(branch => {
      let pid: string | undefined = branch.parentConvId;
      while (pid && pid !== conversation.id) {
        if (collapsedBranchIds.has(pid)) return false;
        pid = branchById.get(pid)?.parentConvId;
      }
      return true;
    });
  }, [conversation.branches, conversation.id, collapsedBranchIds, branchById]);

  return (
    <div className="group/conv relative">
      <button
        type="button"
        onClick={() => onSelectConversation(conversation.id)}
        className={`w-full text-left ${activeId === conversation.id ? 'sidebar-item-active' : 'sidebar-item'}`}
      >
        <div className="flex items-start gap-1.5">
          {hasBranches ? (
            <span className="mt-0.5 flex-shrink-0 text-slate-500">
              <DisclosureTriangle open={isExpanded} />
            </span>
          ) : (
            <span className="w-3 flex-shrink-0" aria-hidden="true" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold truncate pr-6">{conversation.title}</p>
            <p className="text-xs text-slate-600 truncate mt-0.5">{conversation.preview}</p>
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onDeleteConversation(conversation.id)}
        aria-label="대화 삭제"
        className="absolute top-2 right-2 opacity-0 group-hover/conv:opacity-100 transition text-slate-600 hover:text-red-400 p-1 rounded-md hover:bg-slate-800"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>

      {hasBranches && isExpanded && (
        <div className="ml-3 mt-0.5 space-y-0.5 border-l border-slate-700/60 pl-2">
          {visibleBranches.map(branch => (
            <BranchRow
              key={branch.id}
              branch={branch}
              isActive={activeId === branch.id}
              hasChildren={parentBranchIds.has(branch.id)}
              isCollapsed={collapsedBranchIds.has(branch.id)}
              onToggleCollapse={toggleBranchCollapse}
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
  onDeleteConversation,
}) => {
  const [isRecentOpen, setIsRecentOpen] = useState(true);

  return (
    <div
      className="flex-shrink-0 min-h-0 flex flex-col overflow-hidden"
      style={isRecentOpen ? { height } : undefined}
    >
      <div className="p-3 flex-shrink-0">
        <Button onClick={onCreateConversation} variant="primary" fullWidth>
          <span className="text-lg leading-none">+</span> 새 채팅
        </Button>
      </div>

      <SearchPanel />

      <button
        type="button"
        onClick={() => setIsRecentOpen(prev => !prev)}
        className="section-label px-4 py-2 flex items-center gap-1.5 text-left hover:text-slate-300 transition-colors"
      >
        <DisclosureTriangle open={isRecentOpen} />
        최근 대화
      </button>

      {isRecentOpen && (
        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3">
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
                onDeleteConversation={onDeleteConversation}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ConversationList;
