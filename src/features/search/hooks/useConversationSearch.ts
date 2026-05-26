import { useMemo } from 'react';
import { useConversations } from '../../conversation-explorer/hooks/useConversations';
import type { Conversation } from '../../chat/types';
import type { SearchHit } from '../types';

/**
 * SRS FR-6.3 전체 검색 (FE-only 부분 구현).
 *
 * **현재 한계:** 메시지 본문 전문 검색은 BE 검색 엔드포인트가 명세에 없어
 * 구현할 수 없다. 이 hook 은 이미 로드된 conversations 목록의
 * 대화 제목 + lastMessagePreview + 분기 제목만 매칭한다.
 * 메시지 본문 검색이 필요해지면 BE 에 `GET /api/v1/search?q=...` 같은
 * 엔드포인트가 추가되고 별도 hook 으로 교체해야 한다.
 */
const MAX_HITS = 50;

function pushConvHit(out: SearchHit[], conversation: Conversation): void {
  out.push({
    kind: 'conversation',
    label: conversation.title,
    targetId: conversation.id,
    parentConversation: conversation,
    preview: conversation.preview,
  });
}

export function useConversationSearch(query: string): {
  hits: SearchHit[];
  isLoading: boolean;
  isEmpty: boolean;
} {
  const { data: conversations = [], isLoading } = useConversations();

  const hits = useMemo<SearchHit[]>(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    const matched: SearchHit[] = [];

    for (const conversation of conversations) {
      const convMatch =
        conversation.title.toLowerCase().includes(trimmed) ||
        (conversation.preview ?? '').toLowerCase().includes(trimmed);

      if (convMatch) pushConvHit(matched, conversation);

      for (const branch of conversation.branches) {
        if (branch.title.toLowerCase().includes(trimmed)) {
          matched.push({
            kind: 'branch',
            label: branch.title,
            targetId: branch.id,
            parentConversation: conversation,
            branch,
          });
        }
      }

      if (matched.length >= MAX_HITS) break;
    }

    return matched.slice(0, MAX_HITS);
  }, [conversations, query]);

  const trimmed = query.trim();
  return {
    hits,
    isLoading,
    isEmpty: trimmed.length > 0 && !isLoading && hits.length === 0,
  };
}
