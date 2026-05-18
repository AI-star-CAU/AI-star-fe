import { useQueries } from '@tanstack/react-query';
import { chatApi } from '../../chat/api/chatApi';
import type { Message } from '../../chat/types';

const MESSAGE_STALE_TIME_MS = 1000 * 30;

export const useBranchMessages = (branchIds: string[]): Record<string, Message[]> => {
  const results = useQueries({
    // 명세 §2.4: useMessages 는 infinite 캐시(InfiniteData)라 키를 분리해
    // 캐시 shape 충돌을 피한다. (분기는 Phase 3 — 현재 branchIds 는 빈 배열)
    queries: branchIds.map(branchId => ({
      queryKey: ['branchMessages', branchId],
      queryFn: () => chatApi.getMessages(branchId),
      staleTime: MESSAGE_STALE_TIME_MS,
    })),
  });

  return branchIds.reduce<Record<string, Message[]>>((messagesById, branchId, index) => {
    messagesById[branchId] = results[index]?.data ?? [];
    return messagesById;
  }, {});
};
