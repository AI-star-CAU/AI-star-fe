import React from 'react';
import { Link } from 'react-router-dom';
import { chatPath } from '../../../app/router/routes';
import type { SearchHit } from '../types';

interface SearchResultsProps {
  hits: SearchHit[];
  isLoading: boolean;
  isEmpty: boolean;
  query: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ hits, isLoading, isEmpty, query }) => {
  if (!query.trim()) {
    return (
      <p className="text-sm text-slate-500 px-1 py-6 text-center">
        검색어를 입력하세요.
      </p>
    );
  }
  if (isLoading) {
    return (
      <p className="text-sm text-slate-500 px-1 py-6 text-center">불러오는 중…</p>
    );
  }
  if (isEmpty) {
    return (
      <p className="text-sm text-slate-500 px-1 py-6 text-center">
        “{query}” 에 해당하는 대화나 분기가 없어요.
      </p>
    );
  }

  return (
    <ul className="space-y-1">
      {hits.map(hit => (
        <li key={`${hit.kind}-${hit.targetId}`}>
          <Link
            to={chatPath(hit.targetId)}
            className="block px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800/60"
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  hit.kind === 'branch'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-slate-700 text-slate-300'
                }`}
              >
                {hit.kind === 'branch' ? '분기' : '대화'}
              </span>
              <span className="text-sm text-slate-100 truncate">{hit.label}</span>
            </div>
            {hit.kind === 'branch' && (
              <p className="text-xs text-slate-500 mt-1 truncate">
                ↳ {hit.parentConversation.title}
              </p>
            )}
            {hit.preview && (
              <p className="text-xs text-slate-500 mt-1 truncate">{hit.preview}</p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SearchResults;
