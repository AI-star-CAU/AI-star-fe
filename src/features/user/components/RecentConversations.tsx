import React from 'react';
import { Link } from 'react-router-dom';
import { formatRelativeDate } from '../../../shared/utils/date';
import type { Conversation } from '../../chat/types';

interface RecentConversationsProps {
  conversations: Conversation[];
  isLoading: boolean;
  now: number;
}

const RecentConversations: React.FC<RecentConversationsProps> = ({
  conversations,
  isLoading,
  now,
}) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-4">
      <p className="section-label">최근 대화</p>
      <Link
        to="/chat"
        className="text-xs text-cyan-300 hover:text-cyan-200 transition font-semibold"
      >
        모두 보기
      </Link>
    </div>

    {isLoading ? (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-12 bg-slate-800 rounded-xl animate-pulse" />
        ))}
      </div>
    ) : conversations.length === 0 ? (
      <div className="text-center py-8">
        <p className="text-slate-600 text-sm">대화 기록이 없습니다.</p>
        <Link
          to="/chat"
          className="mt-3 text-xs text-cyan-300 hover:text-cyan-200 transition"
        >
          첫 대화 시작하기
        </Link>
      </div>
    ) : (
      <div className="space-y-2">
        {conversations.map(conv => (
          <Link
            key={conv.id}
            to={`/chat/${conv.id}`}
            className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40 hover:border-slate-600 rounded-xl transition group text-left"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition truncate">
                {conv.title}
              </p>
              <p className="text-xs text-slate-600 mt-0.5 truncate">{conv.preview}</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 ml-3">
              {conv.branches.length > 0 && (
                <span className="text-[10px] text-amber-500/80 border border-amber-500/20 rounded-md px-1.5 py-0.5 font-semibold">
                  분기 {conv.branches.length}
                </span>
              )}
              <span className="text-[10px] text-slate-600">
                {formatRelativeDate(conv.createdAt, now)}
              </span>
              <svg className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>
    )}
  </div>
);

export default RecentConversations;
