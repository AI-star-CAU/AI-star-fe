import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { streamSSE } from '../../../shared/api/sse';
import { ApiError } from '../../../shared/api/client';
import { ENDPOINTS } from '../../../shared/api/endpoints';
import {
  parseEventData,
  type TurnStartedData,
  type ChunkData,
  type TurnCompletedData,
  type StreamErrorData,
} from '../api/streamTypes';
import type { Message } from '../types';

export const useRegenerate = (conversationId: string) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const queryClient = useQueryClient();

  // 명세 §4.1 (Phase 3 v0.7): 재생성은 기존 AI 메시지를 덮어쓴다.
  // 새 branch/turn 을 생성하지 않으므로 branch_created 이벤트 없음.
  // chatId 는 originChatId 와 항상 동일 — navigate 불필요.
  const regenerate = useCallback(async (messageId: string, originChatId?: string, userContent = '') => {
    const numericChatId = Number(originChatId ?? conversationId);
    const numericMessageId = Number(messageId);
    if (isNaN(numericChatId) || isNaN(numericMessageId)) return;

    setIsRegenerating(true);
    setLiveMessages([]);

    const targetChatId = String(numericChatId);
    let accumulated = '';

    try {
      for await (const { event, data } of streamSSE(
        ENDPOINTS.chat.regenerate(numericChatId, numericMessageId),
      )) {
        if (event === 'turn_started') {
          const parsed = parseEventData<TurnStartedData>(data);
          if (!parsed) continue;

          const now = new Date().toISOString();
          setLiveMessages([
            {
              id: String(parsed.userMessageId),
              conversationId: targetChatId,
              role: 'user',
              content: userContent,
              createdAt: now,
              status: 'COMPLETED',
              turnId: parsed.turnId,
            },
            {
              id: String(parsed.aiMessageId),
              conversationId: targetChatId,
              role: 'assistant',
              content: '',
              createdAt: now,
              status: 'STREAMING',
              isPending: true,
              turnId: parsed.turnId,
            },
          ]);
        } else if (event === 'chunk') {
          const parsed = parseEventData<ChunkData>(data);
          if (!parsed) continue;
          accumulated += parsed.text;
          setLiveMessages(prev =>
            prev.map(message =>
              message.role === 'assistant'
                ? { ...message, content: accumulated, isPending: false }
                : message,
            ),
          );
        } else if (event === 'turn_completed') {
          const parsed = parseEventData<TurnCompletedData>(data);
          if (!parsed) continue;
          setLiveMessages(prev =>
            prev.map(message =>
              message.role === 'assistant'
                ? {
                    ...message,
                    id: String(parsed.aiMessageId),
                    status: 'COMPLETED',
                    isPending: false,
                    turnId: parsed.turnId,
                  }
                : message,
            ),
          );
        } else if (event === 'error') {
          const parsed = parseEventData<StreamErrorData>(data);
          throw new ApiError(
            500,
            parsed?.message ?? '응답 재생성 중 오류가 발생했습니다.',
            parsed?.code ?? null,
            parsed,
          );
        } else if (event === 'done') {
          await queryClient.invalidateQueries({
            queryKey: ['messages', targetChatId],
          });
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['graph'] });
          setLiveMessages([]);
        }
      }
    } catch (err) {
      setLiveMessages(prev =>
        prev.map(message =>
          message.role === 'assistant'
            ? {
                ...message,
                content:
                  message.content ||
                  (err instanceof ApiError
                    ? `오류: ${err.message}`
                    : '응답 재생성에 실패했습니다.'),
                status: 'FAILED',
                isPending: false,
              }
            : message,
        ),
      );
    } finally {
      setIsRegenerating(false);
    }
  }, [conversationId, queryClient]);

  return { regenerate, isRegenerating, liveMessages };
};
