import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chatApi';
import { streamMessage } from '../api/messageStream';
import { ApiError } from '../../../shared/api/client';
import type { CreateChatRequest, Message } from '../types';

interface UseSendMessageOptions {
  /** 'new' 화면에서 chat 이 생성되면 새 chatId 로 호출된다. */
  onConversationCreated?: (newChatId: string) => void;
  /** 명세 §2.1: 'new' 에서 chat 생성 시 사용할 provider/model. */
  chatOptions?: Partial<CreateChatRequest>;
}

/**
 * 명세 §4.1 / Phase 2 §2.5 SSE 스트리밍으로 메시지를 전송한다.
 * chunk 이벤트를 받을 때마다 react-query 캐시의 assistant 메시지에
 * 실시간으로 누적 반영한다(실시간 토큰 스트리밍).
 */
export const useSendMessage = (
  conversationId: string,
  options?: UseSendMessageOptions,
) => {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  // 명세 §2.6: 스트리밍 중 cancel 호출에 필요한 현재 chat/aiMessage 식별자.
  const activeStreamRef = useRef<{
    chatId: number;
    aiMessageId: number | null;
  } | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isPending) return;
      setIsPending(true);
      setIsCanceling(false);

      // 1) 'new' 화면이면 먼저 chat 을 생성한다 (명세 §6.1 2단계 패턴).
      let targetId = conversationId;
      if (conversationId === 'new') {
        try {
          targetId = String(await chatApi.createChat(options?.chatOptions));
          options?.onConversationCreated?.(targetId);
        } catch {
          setIsPending(false);
          return;
        }
      }

      const key = ['messages', targetId] as const;
      const now = new Date().toISOString();
      const optUserId = `opt-user-${Date.now()}`;
      const optAiId = `opt-ai-${Date.now() + 1}`;

      const previous = queryClient.getQueryData<Message[]>(key);

      // 2) 사용자 메시지 + 응답 대기 메시지를 낙관적으로 추가.
      queryClient.setQueryData<Message[]>(key, old => [
        ...(old ?? []),
        {
          id: optUserId,
          conversationId: targetId,
          role: 'user',
          content,
          createdAt: now,
        },
        {
          id: optAiId,
          conversationId: targetId,
          role: 'assistant',
          content: '',
          createdAt: now,
          isPending: true,
        },
      ]);

      const patchAi = (patch: Partial<Message>) =>
        queryClient.setQueryData<Message[]>(key, old =>
          (old ?? []).map(m => (m.id === optAiId ? { ...m, ...patch } : m)),
        );

      let accumulated = '';
      let realUserMessageId: number | null = null;
      let realAiMessageId: number | null = null;
      let cancelled = false;

      const numericChatId = Number(targetId);
      activeStreamRef.current = { chatId: numericChatId, aiMessageId: null };

      try {
        await streamMessage(numericChatId, content, {
          onTurnStarted: d => {
            realUserMessageId = d.userMessageId;
            realAiMessageId = d.aiMessageId;
            if (activeStreamRef.current) {
              activeStreamRef.current.aiMessageId = d.aiMessageId;
            }
          },
          onChunk: d => {
            accumulated += d.text;
            patchAi({ content: accumulated });
          },
          onTurnCompleted: d => {
            realAiMessageId = d.aiMessageId;
          },
          // 명세 §2.5: cancelled 는 정상 종료 경로. 부분 content 보존.
          onCancelled: d => {
            cancelled = true;
            realAiMessageId = d.aiMessageId;
            if (d.content != null) accumulated = d.content;
          },
        });

        // 3) 스트림 완료 → 낙관적 id 를 서버 id 로 확정.
        queryClient.setQueryData<Message[]>(key, old =>
          (old ?? []).map(m => {
            if (m.id === optUserId && realUserMessageId != null) {
              return { ...m, id: String(realUserMessageId) };
            }
            if (m.id === optAiId) {
              return {
                ...m,
                id:
                  realAiMessageId != null ? String(realAiMessageId) : m.id,
                content: accumulated,
                status: cancelled ? 'CANCELED' : 'COMPLETED',
                isPending: false,
              };
            }
            return m;
          }),
        );

        // 스트림이 끝나면 서버 읽기 경로(GET /chats/{id}/turns, §2.4)에서
        // 실제 값을 다시 가져온다. 낙관적 캐시는 refetch 동안만 표시되고,
        // 백엔드가 더미를 돌려줘도 그 값으로 교체된다.
        queryClient.invalidateQueries({ queryKey: ['messages', targetId] });
        // 사이드바 미리보기/turnCount 갱신.
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      } catch (err) {
        if (accumulated) {
          // 일부라도 받았으면 받은 내용 + 실패 상태 유지 (명세 §2.5 FAILED).
          patchAi({
            content: accumulated,
            status: 'FAILED',
            isPending: false,
          });
        } else if (previous !== undefined) {
          // 한 글자도 못 받았으면 낙관적 추가를 롤백.
          queryClient.setQueryData(key, previous);
        } else {
          patchAi({
            content:
              err instanceof ApiError
                ? `⚠️ ${err.message}`
                : '⚠️ 응답을 받지 못했습니다.',
            status: 'FAILED',
            isPending: false,
          });
        }
      } finally {
        activeStreamRef.current = null;
        setIsPending(false);
        setIsCanceling(false);
      }
    },
    [conversationId, isPending, options, queryClient],
  );

  /**
   * 명세 §2.6: 스트리밍 중 응답 생성 취소.
   * cancel API 만 호출하고, 실제 정리는 SSE 의 cancelled→done 경로에 맡긴다
   * (AbortController 즉시 호출 금지 — 부록 §2.6 주의).
   */
  const cancel = useCallback(async () => {
    const active = activeStreamRef.current;
    if (!active || active.aiMessageId == null || isCanceling) return;
    setIsCanceling(true);
    try {
      await chatApi.cancelMessage(active.chatId, active.aiMessageId);
    } catch {
      // 취소 호출 실패해도 스트림은 계속 진행/종료되므로 상태만 해제.
      setIsCanceling(false);
    }
  }, [isCanceling]);

  return { sendMessage, cancel, isPending, isCanceling };
};
