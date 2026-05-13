import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Conversation, Message } from '../../api/ait';
import GraphPanel, { type NodeAction } from './GraphPanel';
import ResizeHandle from './ResizeHandle';
import { useResizeDrag } from '../../hooks/useResizeDrag';
import Button from '../ui/Button';

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
  const [expandedId, setExpandedId] = useState<string | null>(activeId);

  const { size: convListHeight, onMouseDown: onVerticalDrag } = useResizeDrag(240, 'y', 80, 520);

  const handleNodeClick = useCallback((action: NodeAction) => {
    if (action.type === 'scroll') {
      document.getElementById(`msg-${action.messageId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      navigate(`/chat/${action.branchId}`);
    }
  }, [navigate]);

  return (
    <aside
      className="bg-slate-900 border-r border-slate-800 flex flex-col flex-shrink-0 overflow-hidden transition-[width] duration-200 ease-in-out"
      style={{ width: isOpen ? width : 0 }}
    >
      <div className="p-3 flex-shrink-0">
        <Button
          onClick={() => navigate('/chat/new')}
          variant="primary"
          fullWidth
        >
          <span className="text-lg leading-none">+</span> 새 채팅
        </Button>
      </div>

      <div
        className="overflow-y-auto flex-shrink-0 px-2 pb-3"
        style={{ height: convListHeight }}
      >
        <p className="section-label px-2 py-1.5">최근 대화</p>

        {isLoading ? (
          <div className="space-y-2 px-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-slate-800/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <p className="text-xs text-slate-600 px-3 py-4 text-center">대화가 없습니다</p>
        ) : (
          conversations.map(c => (
            <div key={c.id}>
              <div
                onClick={() => {
                  navigate(`/chat/${c.id}`);
                  setExpandedId(expandedId === c.id ? null : c.id);
                }}
                className={activeId === c.id ? 'sidebar-item-active' : 'sidebar-item'}
              >
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{c.title}</p>
                    <p className="text-xs text-slate-600 truncate mt-0.5">{c.preview}</p>
                  </div>
                  {c.branches.length > 0 && (
                    <span className="text-slate-600 text-xs mt-0.5 flex-shrink-0">
                      {expandedId === c.id ? '▾' : '▸'}
                    </span>
                  )}
                </div>
              </div>

              {c.branches.length > 0 && expandedId === c.id && (
                <div className="ml-3 mt-0.5 space-y-0.5 border-l border-slate-700/60 pl-2">
                  {c.branches.map(b => (
                    <div
                      key={b.id}
                      onClick={() => navigate(`/chat/${b.id}`)}
                      className={`px-2 py-1.5 rounded-lg cursor-pointer transition flex items-center gap-2 ${
                        activeId === b.id
                          ? 'bg-amber-500/15 text-amber-300'
                          : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <svg className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-xs truncate">{b.title}</span>
                      <span className="ml-auto text-[10px] text-slate-600 flex-shrink-0">T{b.forkAtTurnIndex}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ResizeHandle direction="y" onMouseDown={onVerticalDrag} />

      <div className="flex-1 overflow-hidden flex flex-col border-t border-slate-800">
        <div className="px-4 py-2 flex-shrink-0">
          <p className="section-label">분기 구조</p>
        </div>
        <div className="flex-1 overflow-auto px-4 pb-3">
          <GraphPanel messages={messages} conv={conv} onNodeClick={handleNodeClick} />
        </div>
        <div className="px-4 pb-3 space-y-1.5 flex-shrink-0">
          {[
            { cls: 'bg-cyan-600', label: '현재 위치' },
            { cls: 'bg-slate-600', label: 'root' },
            { cls: 'bg-slate-800 border border-slate-700', label: '턴(Q+A)' },
            { cls: 'bg-amber-600', label: '분기 지점' },
          ].map(({ cls, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${cls} flex-shrink-0`} />
              <span className="text-[10px] text-slate-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};

export default ConvSidebar;
