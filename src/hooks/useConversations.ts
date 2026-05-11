import { useQuery } from '@tanstack/react-query';
import { api } from '../api/ait';

export const useConversations = () =>
  useQuery({
    queryKey: ['conversations'],
    queryFn: api.getConversations,
    staleTime: 1000 * 60,
  });
