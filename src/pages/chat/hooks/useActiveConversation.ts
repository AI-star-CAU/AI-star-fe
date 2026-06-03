import { useMemo } from 'react';
import { useChatMeta } from '../../../features/chat/hooks/useChatMeta';
import type { Conversation } from '../../../features/chat/types';

/**
 * 목록(conversations)에서 활성 대화를 찾고, 아직 목록에 없는(갓 생성된) chat 은
 * 메타 조회(useChatMeta)로 보강한다. (ChatLayout 에서 추출 — 동작 동일)
 */
export function useActiveConversation(
  conversations: Conversation[],
  activeConvId: string,
) {
  const listConv = useMemo(
    () => conversations.find(c => c.id === activeConvId),
    [conversations, activeConvId],
  );
  // 명세 §2.3: 목록에 아직 없는(갓 생성된) chat 은 메타 조회로 보강.
  const { data: chatMeta, isLoading: chatMetaLoading } = useChatMeta(
    activeConvId === 'new' ? '' : activeConvId,
  );
  const activeConv = useMemo<typeof listConv>(() => {
    if (listConv) return listConv;
    if (!chatMeta) return undefined;
    return {
      id: String(chatMeta.chatId),
      title: chatMeta.title ?? '제목없음',
      preview: '아직 메시지가 없습니다.',
      createdAt: chatMeta.createdAt,
      turnCount: 0,
      lastMessageAt: null,
      llmProvider: chatMeta.llmProvider,
      llmModel: chatMeta.llmModel,
      branches: [],
    };
  }, [listConv, chatMeta]);

  return { listConv, chatMeta, chatMetaLoading, activeConv };
}
