import type { GraphResponse } from '../types';
import type { TitleStatus } from '../../branch/types';

export interface ChatTitleInfo {
  /** UI 에 그릴 텍스트. PENDING 이면 placeholder. */
  display: string;
  status: TitleStatus | null;
  isPending: boolean;
}

const PENDING_PLACEHOLDER = '제목 생성 중…';
const ROOT_FALLBACK = '제목없음';
const BRANCH_FALLBACK = '새 분기';

/**
 * 명세 §2.1, §2.2 + Phase 3 §0.5 원칙 3.
 *
 * 그래프 응답에서 특정 chat 의 titleStatus 를 읽어 UI 친화 형태로 반환한다.
 * 폴링은 useGraph 가 자동으로 하므로 이 hook 은 순수 derived state.
 */
export function useChatTitle(
  chatId: number | string | null,
  graphData: GraphResponse | undefined,
): ChatTitleInfo {
  if (chatId == null || !graphData) {
    return { display: ROOT_FALLBACK, status: null, isPending: false };
  }

  const numericId = typeof chatId === 'number' ? chatId : Number(chatId);
  const chat = graphData.chats.find(c => c.chatId === numericId);

  if (!chat) {
    return { display: ROOT_FALLBACK, status: null, isPending: false };
  }

  if (chat.titleStatus === 'PENDING') {
    return { display: PENDING_PLACEHOLDER, status: 'PENDING', isPending: true };
  }

  const fallback = chat.parentChatId === null ? ROOT_FALLBACK : BRANCH_FALLBACK;
  return {
    display: chat.title ?? fallback,
    status: chat.titleStatus,
    isPending: false,
  };
}
