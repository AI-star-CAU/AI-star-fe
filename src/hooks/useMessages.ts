import { useQuery } from '@tanstack/react-query';
import { api } from '../api/ait';

export const useMessages = (conversationId: string) =>
  useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => api.getMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 1000 * 30,
  });
