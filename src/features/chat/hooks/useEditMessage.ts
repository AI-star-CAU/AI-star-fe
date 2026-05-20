import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { streamSSE } from '../../../shared/api/sse';
import { ENDPOINTS } from '../../../shared/api/endpoints';
import { chatPath } from '../../../app/router/routes';
import type { Message } from '../types';

export const useEditMessage = (conversationId: string) => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const editMessage = useCallback(async (messageId: string, content: string) => {
    const numericChatId = Number(conversationId);
    const numericMessageId = Number(messageId);
    if (isNaN(numericChatId) || isNaN(numericMessageId)) return;

    setIsEditing(true);
    let newChatId: string | null = null;
    let streamingMsgId: string | null = null;

    try {
      for await (const { event, data } of streamSSE(
        ENDPOINTS.chat.editMessage(numericChatId, numericMessageId),
        { content },
        'PATCH',
      )) {
        if (event === 'branch_created') {
          const parsed = JSON.parse(data) as { newChatId: number };
          newChatId = String(parsed.newChatId);
          navigate(chatPath(newChatId));
          const pendingMsg: Message = {
            id: `streaming-${Date.now()}`,
            conversationId: newChatId,
            role: 'assistant',
            content: '',
            createdAt: new Date().toISOString(),
            isPending: true,
          };
          streamingMsgId = pendingMsg.id;
          queryClient.setQueryData<Message[]>(['messages', newChatId], [pendingMsg]);
        } else if (event === 'chunk' && newChatId && streamingMsgId) {
          const parsed = JSON.parse(data) as { text: string };
          queryClient.setQueryData<Message[]>(['messages', newChatId], old =>
            (old ?? []).map(m =>
              m.id === streamingMsgId ? { ...m, content: m.content + parsed.text } : m,
            ),
          );
        } else if (event === 'turn_completed' && newChatId && streamingMsgId) {
          const parsed = JSON.parse(data) as { aiMessageId: number };
          queryClient.setQueryData<Message[]>(['messages', newChatId], old =>
            (old ?? []).map(m =>
              m.id === streamingMsgId
                ? { ...m, id: String(parsed.aiMessageId), isPending: false }
                : m,
            ),
          );
        } else if (event === 'done' && newChatId) {
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
          queryClient.invalidateQueries({ queryKey: ['graph'] });
        }
      }
    } finally {
      setIsEditing(false);
    }
  }, [conversationId, navigate, queryClient]);

  return { editMessage, isEditing };
};
