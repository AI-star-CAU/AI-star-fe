import React, { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { branchApi } from '../../branch/api/branchApi';
import { graphApi } from '../../graph/api/graphApi';
import { useGraph } from '../../graph/hooks/useGraph';
import type { GraphResponse } from '../../graph/types';
import type { CreateBranchResponse } from '../../branch/types';

function mergeOptimisticBranch(
  graphData: GraphResponse,
  optimisticBranch?: CreateBranchResponse | null,
): GraphResponse {
  if (
    !optimisticBranch ||
    graphData.rootChatId !== optimisticBranch.rootChatId ||
    graphData.chats.some(chat => chat.chatId === optimisticBranch.chatId)
  ) {
    return graphData;
  }

  const parentChat = graphData.chats.find(
    chat => chat.chatId === optimisticBranch.parentId,
  );

  return {
    ...graphData,
    chats: [
      ...graphData.chats,
      {
        chatId: optimisticBranch.chatId,
        title: optimisticBranch.title ?? '제목없음',
        titleStatus: optimisticBranch.titleStatus,
        parentChatId: optimisticBranch.parentId,
        branchPointTurnId: optimisticBranch.branchPointTurnId,
        depth: (parentChat?.depth ?? 0) + 1,
        isDeleted: false,
        lastTurnId: null,
        updatedAt: optimisticBranch.updatedAt,
      },
    ],
    turns: graphData.turns.map(turn =>
      turn.turnId === optimisticBranch.branchPointTurnId
        ? { ...turn, isBranchPoint: true }
        : turn,
    ),
  };
}

function mergeGraphSnapshots(
  previous: GraphResponse | undefined,
  next: GraphResponse,
): GraphResponse {
  if (!previous || previous.rootChatId !== next.rootChatId) {
    return next;
  }

  const activeChatIds = new Set(next.chats.map(chat => chat.chatId));

  const turnsById = new Map(
    previous.turns
      .filter(turn => activeChatIds.has(turn.chatId))
      .map(turn => [turn.turnId, turn]),
  );
  next.turns.forEach(turn => turnsById.set(turn.turnId, turn));

  return {
    ...next,
    chats: next.chats,
    turns: [...turnsById.values()],
  };
}

/**
 * 그래프 스냅샷 조회 + 낙관적 분기 병합 + 확장/복구 + 에러 메시지.
 * (ConvSidebar 에서 추출 — 동작 동일)
 *
 * 주의: handleRestore 는 명세에 없는 POST /chats/{id}/restore(restoreBranch)를
 * 사용한다. BE 명세 확인 전까지 동작을 그대로 보존한다(Refactoring #6).
 */
export function useOptimisticGraphMerge(
  validChatId: number | null,
  optimisticBranch?: CreateBranchResponse | null,
) {
  const queryClient = useQueryClient();
  const {
    data: baseGraphData,
    isFetching: isGraphFetching,
    isError: isGraphError,
    error: graphError,
  } = useGraph(
    validChatId,
    undefined,
    { up: 100, down: 100, includeDeleted: true },
  );
  const [mergedGraphData, setMergedGraphData] = React.useState<typeof baseGraphData>(undefined);

  React.useEffect(() => {
    if (!baseGraphData) {
      setMergedGraphData(undefined);
      return;
    }

    const nextGraphData = mergeOptimisticBranch(baseGraphData, optimisticBranch);
    setMergedGraphData(prev => mergeGraphSnapshots(prev, nextGraphData));
  }, [baseGraphData, optimisticBranch]);

  const handleRestore = useCallback(async (chatId: string) => {
    const numericId = Number(chatId);
    if (isNaN(numericId)) return;
    await branchApi.restoreBranch(numericId);
    if (validChatId) {
      setMergedGraphData(undefined);
      await queryClient.invalidateQueries({ queryKey: ['graph', validChatId], exact: false });
      await queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  }, [queryClient, validChatId]);

  const handleExpand = useCallback(async (fromTurnId: number, direction: 'UP' | 'DOWN') => {
    if (!validChatId) return;
    const result = await graphApi.expandGraph(validChatId, {
      fromTurnId,
      direction,
      includeDeleted: true,
    });
    setMergedGraphData(prev => {
      if (!prev) return prev;
      const existingIds = new Set(prev.turns.map(t => t.turnId));
      const newTurns = result.turns.filter(t => !existingIds.has(t.turnId));
      const updatedFrontier = {
        up: direction === 'UP' ? result.frontier.up : prev.frontier.up,
        down: direction === 'DOWN' ? result.frontier.down : prev.frontier.down,
      };
      return { ...prev, turns: [...prev.turns, ...newTurns], frontier: updatedFrontier };
    });
  }, [validChatId]);

  const graphErrorMessage = isGraphError
    ? graphError instanceof Error && graphError.message
      ? graphError.message
      : '그래프를 불러오지 못했습니다.'
    : null;

  return { mergedGraphData, isGraphFetching, handleRestore, handleExpand, graphErrorMessage };
}
