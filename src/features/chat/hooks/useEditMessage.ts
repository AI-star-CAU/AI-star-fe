import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { streamSSE } from '../../../shared/api/sse';
import { ApiError } from '../../../shared/api/client';
import { ENDPOINTS } from '../../../shared/api/endpoints';
import { chatPath } from '../../../app/router/routes';
import type { Message } from '../types';

interface BranchCreatedData {
  newChatId: number;
  branchPointTurnId: number;
  title: string | null;
  titleStatus: 'PENDING' | 'GENERATED' | 'USER_EDITED';
}

interface TurnStartedData {
  turnId: number;
  userMessageId: number;
  aiMessageId: number;
}

interface ChunkData {
  text: string;
}

interface TurnCompletedData {
  turnId: number;
  aiMessageId: number;
  answerToken: number;
  summaryStatus: 'PENDING';
}

interface StreamErrorData {
  code?: string;
  message?: string;
  retryable?: boolean;
}

function parseEventData<T>(data: string): T | null {
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}

export const useEditMessage = (conversationId: string) => {
  const [isEditing, setIsEditing] = useState(false);
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const editMessage = useCallback(async (messageId: string, content: string) => {
    const numericChatId = Number(conversationId);
    const numericMessageId = Number(messageId);
    if (isNaN(numericChatId) || isNaN(numericMessageId)) return;

    setIsEditing(true);
    setLiveMessages([]);

    let newChatId: string | null = null;
    let accumulated = '';

    try {
      for await (const { event, data } of streamSSE(
        ENDPOINTS.chat.editMessage(numericChatId, numericMessageId),
        { content },
        'PATCH',
      )) {
        if (event === 'branch_created') {
          const parsed = parseEventData<BranchCreatedData>(data);
          if (!parsed) continue;
          newChatId = String(parsed.newChatId);
          navigate(chatPath(newChatId));
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['graph'] });
        } else if (event === 'turn_started' && newChatId) {
          const parsed = parseEventData<TurnStartedData>(data);
          if (!parsed) continue;
          const now = new Date().toISOString();
          setLiveMessages([
            {
              id: String(parsed.userMessageId),
              conversationId: newChatId,
              role: 'user',
              content,
              createdAt: now,
              status: 'COMPLETED',
              turnId: parsed.turnId,
            },
            {
              id: String(parsed.aiMessageId),
              conversationId: newChatId,
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
            parsed?.message ?? '메시지 수정 응답 생성 중 오류가 발생했습니다.',
            parsed,
          );
        } else if (event === 'done') {
          if (newChatId) {
            await queryClient.invalidateQueries({ queryKey: ['messages', newChatId] });
            queryClient.invalidateQueries({ queryKey: ['conversations'] });
            queryClient.invalidateQueries({ queryKey: ['graph'] });
          }
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
                    : '메시지 수정 응답 생성에 실패했습니다.'),
                status: 'FAILED',
                isPending: false,
              }
            : message,
        ),
      );
    } finally {
      setIsEditing(false);
    }
  }, [conversationId, navigate, queryClient]);

  return { editMessage, isEditing, liveMessages };
};
