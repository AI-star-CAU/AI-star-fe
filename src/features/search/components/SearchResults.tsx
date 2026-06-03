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
      <p className="text-sm text-ui-text-faint px-1 py-6 text-center">
        검색어를 입력하세요.
      </p>
    );
  }
  if (isLoading) {
    return (
      <p className="text-sm text-ui-text-faint px-1 py-6 text-center">불러오는 중…</p>
    );
  }
  if (isEmpty) {
    return (
      <p className="text-sm text-ui-text-faint px-1 py-6 text-center">
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
            className="block px-3 py-2 rounded-lg bg-ui-surface-muted hover:bg-ui-surface-subtle border border-ui-line/60"
          >
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                  hit.kind === 'branch'
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-ui-surface-strong text-ui-text-muted'
                }`}
              >
                {hit.kind === 'branch' ? '분기' : '대화'}
              </span>
              <span className="text-sm text-ui-text truncate">{hit.label}</span>
            </div>
            {hit.kind === 'branch' && (
              <p className="text-xs text-ui-text-faint mt-1 truncate">
                ↳ {hit.parentConversation.title}
              </p>
            )}
            {hit.preview && (
              <p className="text-xs text-ui-text-faint mt-1 truncate">{hit.preview}</p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SearchResults;
