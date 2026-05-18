import { useQuery } from '@tanstack/react-query';
import { branchApi } from '../api/branchApi';

export const useGraph = (chatId: number | null, centerTurnId?: number) =>
  useQuery({
    queryKey: ['graph', chatId, centerTurnId],
    queryFn: () => branchApi.getGraph(chatId!, { centerTurnId }),
    enabled: chatId !== null,
    staleTime: 1000 * 30,
  });
