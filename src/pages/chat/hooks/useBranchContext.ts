import { useMemo } from 'react';
import { useMessages } from '../../../features/chat/hooks/useMessages';
import { useGraph } from '../../../features/graph/hooks/useGraph';
import {
  getForkTurnIndexByTurnId,
  removePreTurnAssistantMessages,
} from '../../../features/chat/utils/messageHelpers';
import type { Conversation, ChatMetaResponse } from '../../../features/chat/types';
import type { Branch, CreateBranchResponse } from '../../../features/branch/types';

interface UseBranchContextParams {
  conversations: Conversation[];
  activeConvId: string;
  optimisticBranch: CreateBranchResponse | null;
  chatMeta: ChatMetaResponse | undefined;
  activeConv: Conversation | undefined;
}

/**
 * 활성 분기 컨텍스트: graphRootId, 부모 메시지, 활성 분기 모델, 분기 마커 라벨(B{n}).
 * (ChatLayout 에서 추출 — useMemo 의존성/계산 동일)
 *
 * Phase 4 §2.1: 탐색기에서 온 분기는 forkAtTurnIndex 를 모르므로
 * branchPointTurnId + 부모 메시지로 fork 위치를 항상 재계산한다.
 */
export function useBranchContext({
  conversations,
  activeConvId,
  optimisticBranch,
  chatMeta,
  activeConv,
}: UseBranchContextParams) {
  const graphRootId = useMemo(() => {
    if (activeConvId === 'new') return null;
    if (optimisticBranch && String(optimisticBranch.chatId) === activeConvId) {
      return String(optimisticBranch.rootChatId);
    }
    if (
      chatMeta &&
      String(chatMeta.chatId) === activeConvId &&
      chatMeta.rootChatId != null
    ) {
      return String(chatMeta.rootChatId);
    }
    return activeConvId;
  }, [activeConvId, optimisticBranch, chatMeta]);
  const listedActiveBranch = useMemo(
    () => conversations.flatMap(c => c.branches).find(branch => branch.id === activeConvId),
    [conversations, activeConvId],
  );
  const metaBranchParentId = useMemo(() => {
    if (listedActiveBranch) return listedActiveBranch.parentConvId;
    if (optimisticBranch && String(optimisticBranch.chatId) === activeConvId) {
      return String(optimisticBranch.parentId);
    }
    if (
      chatMeta &&
      String(chatMeta.chatId) === activeConvId &&
      chatMeta.parentId != null
    ) {
      return String(chatMeta.parentId);
    }
    return null;
  }, [listedActiveBranch, optimisticBranch, activeConvId, chatMeta]);
  const metaBranchPointTurnId = useMemo(() => {
    if (optimisticBranch && String(optimisticBranch.chatId) === activeConvId) {
      return optimisticBranch.branchPointTurnId;
    }
    // Phase 4 §2.1: 탐색기에서 내려온 분기 노드는 branchPointTurnId 를 갖는다.
    if (listedActiveBranch?.branchPointTurnId != null) {
      return listedActiveBranch.branchPointTurnId;
    }
    if (
      chatMeta &&
      String(chatMeta.chatId) === activeConvId &&
      chatMeta.branchPointTurnId != null
    ) {
      return chatMeta.branchPointTurnId;
    }
    return null;
  }, [optimisticBranch, activeConvId, chatMeta, listedActiveBranch]);
  const { data: parentMessages = [], isLoading: parentMsgsLoading } = useMessages(
    metaBranchParentId ?? '',
  );
  const activeBranch = useMemo<Branch | undefined>(() => {
    // Phase 4 §2.1: 탐색기에서 온 분기는 turn 인덱스를 모르므로(forkAtTurnIndex=0)
    // branchPointTurnId + 부모 메시지로 정확한 fork 위치를 항상 재계산한다.
    if (!metaBranchParentId || metaBranchPointTurnId == null) {
      return listedActiveBranch ?? undefined;
    }

    const parentForkIndex =
      getForkTurnIndexByTurnId(
        removePreTurnAssistantMessages(parentMessages),
        metaBranchPointTurnId,
      ) ?? 1;

    return {
      id: activeConvId,
      parentConvId: metaBranchParentId,
      title: listedActiveBranch?.title ?? activeConv?.title ?? '제목없음',
      forkAtTurnIndex: parentForkIndex,
      depth: listedActiveBranch?.depth,
      branchPointTurnId: metaBranchPointTurnId,
    };
  }, [
    listedActiveBranch,
    metaBranchParentId,
    metaBranchPointTurnId,
    parentMessages,
    activeConvId,
    activeConv,
  ]);
  const activeParentConv = useMemo(
    () => conversations.find(conversation => conversation.id === activeBranch?.parentConvId),
    [activeBranch, conversations],
  );
  const activeBranchNumber = useMemo(
    () => {
      if (!activeBranch) return null;
      if (!activeParentConv) return 1;
      const index = activeParentConv.branches.findIndex(branch => branch.id === activeBranch.id);
      return index >= 0 ? index + 1 : 1;
    },
    [activeBranch, activeParentConv],
  );
  // GraphPanel 과 동일한 정렬(depth ASC, chatId ASC)로 B{n} 컬럼을 매긴다.
  // useGraph 캐시 키가 동일하면 ConvSidebar 와 fetch 를 공유한다.
  const graphChatIdNum = useMemo(() => {
    if (activeConvId === 'new') return null;
    const n = Number(activeConvId);
    return Number.isFinite(n) ? n : null;
  }, [activeConvId]);
  const { data: branchLabelGraphData } = useGraph(graphChatIdNum);
  const activeBranchMarkerLabel = useMemo(() => {
    if (!activeBranch) return undefined;
    const chats = branchLabelGraphData?.chats;
    if (chats && chats.length > 0) {
      const sorted = [...chats].sort((a, b) => a.depth - b.depth || a.chatId - b.chatId);
      const rootChat = sorted.find(c => c.parentChatId === null);
      if (rootChat) {
        let col = 0;
        for (const chat of sorted) {
          if (chat.chatId === rootChat.chatId) continue;
          col += 1;
          if (String(chat.chatId) === activeBranch.id) return `B${col}`;
        }
      }
    }
    return activeBranchNumber ? `B${activeBranchNumber}` : 'B1';
  }, [activeBranch, activeBranchNumber, branchLabelGraphData]);

  return {
    graphRootId,
    activeBranch,
    parentMessages,
    parentMsgsLoading,
    activeBranchMarkerLabel,
  };
}
