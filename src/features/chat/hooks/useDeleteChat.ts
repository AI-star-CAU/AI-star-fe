import { useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chatApi';

/**
 * 명세 §2.7: 대화 소프트 삭제. 성공 시 대화 목록 캐시를 무효화한다.
 */
export const useDeleteChat = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId: number) => chatApi.deleteChat(chatId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
  });
};
