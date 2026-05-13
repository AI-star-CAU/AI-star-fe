import { useQuery } from '@tanstack/react-query';
import { chatApi } from '../api/chatApi';

export const useConversations = () =>
  useQuery({
    queryKey: ['conversations'],
    queryFn: chatApi.getConversations,
    staleTime: 1000 * 60,
  });
