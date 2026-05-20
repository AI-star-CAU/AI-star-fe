import { useCallback, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { chatApi } from '../api/chatApi';
import { streamMessage } from '../api/messageStream';
import { ApiError } from '../../../shared/api/client';
import { deriveChatTitle } from '../utils/title';
import type { CreateChatRequest, Message } from '../types';

interface UseSendMessageOptions {
  /** 'new' 화면에서 chat 이 생성되면 새 chatId 로 호출된다. */
  onConversationCreated?: (newChatId: string) => void;
  /** 명세 §2.1: 'new' 에서 chat 생성 시 사용할 provider/model. */
  chatOptions?: Partial<CreateChatRequest>;
}

/**
 * 명세 §2.5 SSE 스트리밍으로 메시지를 전송한다.
 *
 * 메시지 히스토리(useMessages)는 명세 §2.4 cursor 무한스크롤 캐시
 * (InfiniteData)라서 여기서 그 캐시를 직접 건드리지 않는다. 대신
 * 진행 중인 턴(사용자 + 스트리밍 AI)을 로컬 state(liveMessages)로 들고
 * 있다가, 스트림이 끝나면 ['messages', id] 를 무효화해 서버 읽기 경로에서
 * 실제 값을 다시 받아 확정한다(부분 깜빡임 방지를 위해 refetch 후 정리).
 */
export const useSendMessage = (
  conversationId: string,
  options?: UseSendMessageOptions,
) => {
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  /** 진행 중인 턴의 임시 메시지(0개 또는 [user, ai]). 히스토리 뒤에 붙인다. */
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  // 명세 §2.6: 스트리밍 중 cancel 호출에 필요한 현재 chat/aiMessage 식별자.
  const activeStreamRef = useRef<{
    chatId: number;
    aiMessageId: number | null;
  } | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (isPending) return;
      setIsPending(true);
      setIsCanceling(false);

      // 1) 'new' 화면이면 먼저 chat 을 생성한다 (명세 §0.2.1 2단계 패턴).
      let targetId = conversationId;
      if (conversationId === 'new') {
        try {
          targetId = String(await chatApi.createChat({
            ...options?.chatOptions,
            title: options?.chatOptions?.title ?? deriveChatTitle(content),
          }));
          options?.onConversationCreated?.(targetId);
        } catch (err) {
          console.error('[sendMessage] chat creation failed:', err);
          setIsPending(false);
          return;
        }
      }

      const now = new Date().toISOString();
      const optUserId = `opt-user-${Date.now()}`;
      const optAiId = `opt-ai-${Date.now() + 1}`;

      // 2) 사용자 메시지 + 응답 대기 메시지를 로컬에 낙관적으로 표시.
      setLiveMessages([
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

      // turn_started 후에는 AI 메시지 id 가 서버 id 로 교체되므로 role 로 식별한다.
      // (liveMessages 에는 동시에 최대 1개의 assistant 메시지만 존재)
      const patchAi = (patch: Partial<Message>) =>
        setLiveMessages(prev =>
          prev.map(m => (m.role === 'assistant' ? { ...m, ...patch } : m)),
        );

      let accumulated = '';
      let cancelled = false;
      const numericChatId = Number(targetId);
      activeStreamRef.current = { chatId: numericChatId, aiMessageId: null };

      try {
        await streamMessage(numericChatId, content, {
          onTurnStarted: d => {
            if (activeStreamRef.current) {
              activeStreamRef.current.aiMessageId = d.aiMessageId;
            }
            // 명세 §2.5: 서버가 부여한 진짜 id 로 교체.
            // 'new' → /chat/{id} 전환 직후 useMessages 가 진행 중인 턴을
            // history 로 가져와 liveMessages 와 중복으로 보이는 race 를
            // 해소하려면 id 가 서버 id 와 일치해야 ChatPage 의 dedupe 가 동작한다.
            setLiveMessages(prev =>
              prev.map(m => {
                if (m.id === optUserId) {
                  return { ...m, id: String(d.userMessageId), turnId: d.turnId };
                }
                if (m.id === optAiId || m.role === 'assistant') {
                  return { ...m, id: String(d.aiMessageId), turnId: d.turnId };
                }
                return m;
              }),
            );
          },
          onChunk: d => {
            accumulated += d.text;
            patchAi({ content: accumulated });
          },
          onTurnCompleted: () => {
            /* 확정은 서버 refetch 로 처리 */
          },
          // 명세 §2.5: cancelled 는 정상 종료 경로. 부분 content 보존.
          onCancelled: d => {
            cancelled = true;
            if (d.content != null) accumulated = d.content;
          },
        });

        // 3) 스트림 정상 종료(성공/취소) → 서버 읽기 경로(GET /chats/{id}/turns,
        //    §2.4)에서 실제 값을 다시 받아 히스토리에 확정한 뒤 임시 메시지 제거.
        //    refetch 가 끝난 다음 비워야 메시지가 잠깐 사라지는 깜빡임이 없다.
        await queryClient.invalidateQueries({
          queryKey: ['messages', targetId],
        });
        setLiveMessages([]);
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
        queryClient.invalidateQueries({ queryKey: ['graph'] });
        void cancelled;
      } catch (err) {
        if (accumulated) {
          // 일부라도 받았으면 받은 내용 + 실패 상태 유지 (명세 §2.5 FAILED).
          patchAi({
            content: accumulated,
            status: 'FAILED',
            isPending: false,
          });
        } else {
          // 한 글자도 못 받았으면: 메시지가 있으면 에러 표시, 아니면 롤백.
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

  return { sendMessage, cancel, isPending, isCanceling, liveMessages };
};
