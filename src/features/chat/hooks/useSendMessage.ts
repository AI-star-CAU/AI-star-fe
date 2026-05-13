import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chatApi';
import type { Message } from '../types';

export const useSendMessage = (conversationId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) => chatApi.sendMessage(conversationId, content),

    onMutate: async (content: string) => {
      await queryClient.cancelQueries({ queryKey: ['messages', conversationId] });

      const previousMessages = queryClient.getQueryData<Message[]>(['messages', conversationId]);

      const optimisticUser: Message = {
        id: `opt-user-${Date.now()}`,
        conversationId,
        role: 'user',
        content,
        createdAt: new Date().toISOString(),
      };
      const optimisticPending: Message = {
        id: `opt-pending-${Date.now() + 1}`,
        conversationId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        isPending: true,
      };

      queryClient.setQueryData<Message[]>(['messages', conversationId], old => [
        ...(old ?? []),
        optimisticUser,
        optimisticPending,
      ]);

      return { previousMessages };
    },

    onSuccess: (newMessage) => {
      queryClient.setQueryData<Message[]>(['messages', conversationId], old =>
        (old ?? []).map(m => (m.isPending ? { ...newMessage, isPending: false } : m))
      );
    },

    onError: (_err, _vars, context) => {
      if (context?.previousMessages !== undefined) {
        queryClient.setQueryData(['messages', conversationId], context.previousMessages);
      }
    },
  });
};
