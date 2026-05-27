import { useQuery } from '@tanstack/react-query';
import { explorerApi } from '../api/explorerApi';
import { mapExplorerPageToConversations } from '../utils/explorerMappers';
import type { ExplorerPage } from '../types';

/**
 * 사이드바·마이페이지가 쓰는 대화 목록.
 *
 * Phase 4 §2.1: 데이터 소스를 `/chats`(루트만 반환) → `/chats/explorer`(루트 +
 * 하위 분기 트리)로 교체했다. 결과를 기존 `Conversation[]` 모델로 매핑하므로
 * ChatLayout·ConvSidebar 등 소비처는 그대로 동작하되, 이제 분기 트리가 함께 채워진다.
 * 정렬은 명세 기본값 `recent`(lastActivityAt DESC)를 사용한다.
 *
 * queryKey 는 `['conversations']` 를 유지해 기존 무효화 호출과 호환된다.
 * Phase 3 §0.5 원칙 3: 분기 title 은 비동기 생성되므로, `titleStatus: PENDING`
 * 노드가 남아 있는 동안 ~3초 간격으로 재조회해 GENERATED 로 바뀌면 즉시 반영한다.
 */
const POLL_INTERVAL_MS = 3000;

function hasPendingTitle(page: ExplorerPage | undefined): boolean {
  if (!page) return false;
  return page.roots.some(tree =>
    tree.nodes.some(node => node.titleStatus === 'PENDING'),
  );
}

export const useConversations = () =>
  useQuery({
    queryKey: ['conversations'],
    queryFn: () => explorerApi.getExplorerPage({ sort: 'recent', size: 50 }),
    staleTime: 1000 * 30,
    select: mapExplorerPageToConversations,
    refetchInterval: query =>
      hasPendingTitle(query.state.data) ? POLL_INTERVAL_MS : false,
  });
