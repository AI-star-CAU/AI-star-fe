import { useMemo } from 'react';
import {
  getMessagesThroughFork,
  removePreTurnAssistantMessages,
} from '../../../features/chat/utils/messageHelpers';
import type { Message } from '../../../features/chat/types';
import type { Branch } from '../../../features/branch/types';

interface UseLiveMessageMergeParams {
  history: Message[];
  sendLiveMessages: Message[];
  regenerateLiveMessages: Message[];
  editLiveMessages: Message[];
  activeConvId: string;
  activeBranch: Branch | undefined;
  parentMessages: Message[];
}

/**
 * 히스토리(§2.4 무한스크롤)에 진행 중인 스트리밍 턴(send/regenerate/edit live)을
 * 병합하고, 활성 분기일 때 부모 prefix 를 앞에 붙인 visibleMessages 를 만든다.
 * (ChatLayout 에서 추출 — useMemo 의존성/계산 동일)
 */
export function useLiveMessageMerge({
  history,
  sendLiveMessages,
  regenerateLiveMessages,
  editLiveMessages,
  activeConvId,
  activeBranch,
  parentMessages,
}: UseLiveMessageMergeParams) {
  // 히스토리(§2.4 무한스크롤) + 진행 중인 스트리밍 턴(liveMessages)을 합친다.
  // 'new' → /chat/{id} 직후 useMessages 가 진행 중 턴을 history 로 가져오면
  // liveMessages 와 중복으로 보이므로, turn_started 이후 매칭되는 id 는 제거한다.
  const messages = useMemo(() => {
    const liveMessages = [
      ...sendLiveMessages,
      ...regenerateLiveMessages,
      ...editLiveMessages,
    ].filter(message => message.conversationId === activeConvId);
    if (liveMessages.length === 0) return history;
    const liveIds = new Set(liveMessages.map(m => m.id));
    const dedupedHistory = history.filter(h => !liveIds.has(h.id));
    return [...dedupedHistory, ...liveMessages];
  }, [history, sendLiveMessages, regenerateLiveMessages, editLiveMessages, activeConvId]);
  const visibleMessages = useMemo(
    () => {
      const normalizedMessages = removePreTurnAssistantMessages(messages);
      if (!activeBranch) {
        return {
          messages: normalizedMessages,
          branchStartIndex: undefined,
        };
      }

      const parentPrefixMessages = getMessagesThroughFork(
        removePreTurnAssistantMessages(parentMessages),
        activeBranch.forkAtTurnIndex,
      );

      return {
        messages: [...parentPrefixMessages, ...normalizedMessages],
        branchStartIndex: parentPrefixMessages.length,
      };
    },
    [activeBranch, parentMessages, messages],
  );

  return { messages, visibleMessages };
}
