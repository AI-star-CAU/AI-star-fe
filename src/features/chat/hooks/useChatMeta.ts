import { useQuery } from '@tanstack/react-query';
import { chatApi } from '../api/chatApi';

/**
 * 명세 §2.3: 대화 메타정보(제목/모델 등) 단건 조회.
 * 목록에 아직 없는 갓 생성된 chat 의 제목/모델을 즉시 보여줄 때 사용.
 */
export const useChatMeta = (conversationId: string) => {
  const chatId = Number(conversationId);
  const enabled =
    !!conversationId &&
    conversationId !== 'new' &&
    Number.isFinite(chatId) &&
    chatId > 0;

  return useQuery({
    queryKey: ['chatMeta', conversationId],
    queryFn: () => chatApi.getChatMeta(chatId),
    enabled,
    staleTime: 1000 * 60,
  });
};
