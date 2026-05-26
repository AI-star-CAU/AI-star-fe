import React, { useState } from 'react';
import SearchInput from './SearchInput';
import SearchResults from './SearchResults';
import { useConversationSearch } from '../hooks/useConversationSearch';

const SearchPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const { hits, isLoading, isEmpty } = useConversationSearch(query);

  return (
    <section className="px-3 pb-3 border-b border-slate-800">
      <p className="section-label px-1 py-1.5">검색</p>
      <SearchInput value={query} onChange={setQuery} />
      <div className="mt-2 max-h-48 overflow-y-auto">
        <SearchResults
          hits={hits}
          isLoading={isLoading}
          isEmpty={isEmpty}
          query={query}
        />
      </div>
    </section>
  );
};

export default SearchPanel;
