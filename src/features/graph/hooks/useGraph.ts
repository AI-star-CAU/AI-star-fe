import { useQuery } from '@tanstack/react-query';
import { graphApi } from '../api/graphApi';
import type { GraphResponse } from '../types';

/**
 * 명세 §3.1 그래프 조회.
 *
 * Phase 3 §0.5 원칙 3: turn summary 와 분기 title 은 저장 시점 비동기로
 * 생성된다. 응답에 `summaryStatus: PENDING` / `titleStatus: PENDING` 인 노드가
 * 남아 있는 동안에는 ~3 초 간격으로 자동 재조회해서 GENERATED 로 바뀌는 즉시
 * 화면에 반영한다. 모두 GENERATED/USER_EDITED 가 되면 폴링은 자동 중지.
 */
const POLL_INTERVAL_MS = 3000;

function hasAsyncPending(data: GraphResponse | undefined): boolean {
  if (!data) return false;
  if (data.chats.some(chat => chat.titleStatus === 'PENDING')) return true;
  if (data.turns.some(turn => turn.summaryStatus === 'PENDING')) return true;
  return false;
}

export const useGraph = (chatId: number | null, centerTurnId?: number) =>
  useQuery({
    queryKey: ['graph', chatId, centerTurnId],
    queryFn: () => graphApi.getGraph(chatId!, { centerTurnId }),
    enabled: chatId !== null,
    staleTime: 0,
    refetchInterval: query =>
      hasAsyncPending(query.state.data) ? POLL_INTERVAL_MS : false,
  });
