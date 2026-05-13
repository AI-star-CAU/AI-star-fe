import { useQueries } from '@tanstack/react-query';
import { chatApi } from '../../chat/api/chatApi';
import type { Message } from '../../chat/types';

const MESSAGE_STALE_TIME_MS = 1000 * 30;

export const useBranchMessages = (branchIds: string[]): Record<string, Message[]> => {
  const results = useQueries({
    queries: branchIds.map(branchId => ({
      queryKey: ['messages', branchId],
      queryFn: () => chatApi.getMessages(branchId),
      staleTime: MESSAGE_STALE_TIME_MS,
    })),
  });

  return branchIds.reduce<Record<string, Message[]>>((messagesById, branchId, index) => {
    messagesById[branchId] = results[index]?.data ?? [];
    return messagesById;
  }, {});
};
