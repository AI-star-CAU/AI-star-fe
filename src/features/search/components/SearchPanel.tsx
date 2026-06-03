import React, { useState } from 'react';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';
import { useConversationSearch } from '../hooks/useConversationSearch';

const SectionTriangle: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    className={`w-3 h-3 transition-transform duration-150 ${open ? 'rotate-90' : ''}`}
    viewBox="0 0 12 12"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M4 2.5l4 3.5-4 3.5z" />
  </svg>
);

const SearchPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const trimmedQuery = query.trim();
  const { hits, isLoading, isEmpty } = useConversationSearch(query);

  return (
    <section className="border-b border-ui-line flex-shrink-0">
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className="section-label w-full px-4 py-2 flex items-center gap-1.5 text-left hover:text-ui-text-muted transition-colors"
      >
        <SectionTriangle open={isOpen} />
        검색
      </button>

      {isOpen && (
        <div className="px-3 pb-3">
          <SearchInput value={query} onChange={setQuery} />

          {trimmedQuery && (
            <div className="mt-2 max-h-48 overflow-y-auto">
              <SearchResults
                hits={hits}
                isLoading={isLoading}
                isEmpty={isEmpty}
                query={query}
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default SearchPanel;
