import { useQuery } from '@tanstack/react-query';
import { chatApi } from '../api/chatApi';

export const useMessages = (conversationId: string) =>
  useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => chatApi.getMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 1000 * 30,
  });
