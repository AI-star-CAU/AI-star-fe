import { useQueries } from '@tanstack/react-query';
import { api, type Message } from '../api/ait';

const MESSAGE_STALE_TIME_MS = 1000 * 30;

export const useBranchMessages = (branchIds: string[]): Record<string, Message[]> => {
  const results = useQueries({
    queries: branchIds.map(branchId => ({
      queryKey: ['messages', branchId],
      queryFn: () => api.getMessages(branchId),
      staleTime: MESSAGE_STALE_TIME_MS,
    })),
  });

  return branchIds.reduce<Record<string, Message[]>>((messagesById, branchId, index) => {
    messagesById[branchId] = results[index]?.data ?? [];
    return messagesById;
  }, {});
};
