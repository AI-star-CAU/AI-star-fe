import { useInfiniteQuery } from '@tanstack/react-query';
import { chatApi } from '../api/chatApi';
import { mapTurnListToMessages } from '../api/chatMappers';
import type { TurnPageResponse } from '../types';

const PAGE_LIMIT = 20;
const EMPTY_PAGE: TurnPageResponse = {
  turns: [],
  nextTurnSequence: null,
  hasMore: false,
};

/**
 * 명세 §2.4: cursor 기반 무한 스크롤.
 * 첫 페이지는 cursor 없이 최신 PAGE_LIMIT 턴(BACKWARD)을 받고,
 * 위로 스크롤하면 nextTurnSequence 를 lastTurnSequence 로 보내 과거 턴을 잇는다.
 * select 로 평탄화하므로 소비자는 기존처럼 Message[] 를 그대로 쓴다
 * (pages[0] 이 최신 → 화면은 과거가 위로 가도록 역순 평탄화).
 */
export const useMessages = (conversationId: string) =>
  useInfiniteQuery({
    queryKey: ['messages', conversationId],
    enabled: !!conversationId,
    initialPageParam: undefined as number | undefined,
    queryFn: ({ pageParam }) => {
      const chatId = Number(conversationId);
      if (conversationId === 'new' || !Number.isFinite(chatId)) {
        return EMPTY_PAGE;
      }
      return chatApi.getTurnsPage(chatId, {
        lastTurnSequence: pageParam,
        direction: 'BACKWARD',
        limit: PAGE_LIMIT,
      });
    },
    getNextPageParam: (lastPage: TurnPageResponse) =>
      lastPage.hasMore ? lastPage.nextTurnSequence ?? undefined : undefined,
    select: data =>
      [...data.pages]
        .reverse()
        .flatMap(page => mapTurnListToMessages(page.turns, conversationId)),
    staleTime: 1000 * 30,
  });
