import { useMutation, useQueryClient } from '@tanstack/react-query';
import { graphApi } from '../api/graphApi';
import type { ExpandGraphResponse, GraphResponse } from '../types';

interface ExpandVars {
  chatId: number;
  fromTurnId: number;
  direction: 'UP' | 'DOWN';
  limit?: number;
  includeDeleted?: boolean;
}

/**
 * 명세 §3.2 그래프 윈도우 확장.
 *
 * `GET /chats/{id}/graph/expand` 결과를 받아 기존 graph 캐시에 머지한다.
 * 같은 turnId 중복은 제거, frontier 는 요청한 방향만 새 값으로 교체.
 *
 * (현재 ConvSidebar 에서 직접 graphApi.expandGraph 를 부르고 setState 로 머지하는데,
 *  이 hook 으로 옮기면 React Query 캐시에 직접 머지되어 useGraph 구독자 전체가 즉시 갱신된다.)
 */
export const useGraphExpand = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatId, fromTurnId, direction, limit, includeDeleted }: ExpandVars) =>
      graphApi.expandGraph(chatId, { fromTurnId, direction, limit, includeDeleted }),
    onSuccess: (result: ExpandGraphResponse, vars) => {
      // 모든 centerTurnId 변형을 포함해서 같은 chatId 의 캐시를 갱신한다.
      queryClient.setQueriesData<GraphResponse>(
        { queryKey: ['graph', vars.chatId], exact: false },
        prev => {
          if (!prev) return prev;
          const existingIds = new Set(prev.turns.map(t => t.turnId));
          const newTurns = result.turns.filter(t => !existingIds.has(t.turnId));
          return {
            ...prev,
            turns: [...prev.turns, ...newTurns],
            frontier: {
              up: vars.direction === 'UP' ? result.frontier.up : prev.frontier.up,
              down: vars.direction === 'DOWN' ? result.frontier.down : prev.frontier.down,
            },
          };
        },
      );
    },
  });
};
