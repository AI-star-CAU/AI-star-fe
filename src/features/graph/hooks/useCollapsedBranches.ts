import { useMemo } from 'react';
import type { GraphResponse } from '../types';

export interface CollapsedBranch {
  /** 접힌 분기의 chatId. 클릭 시 이 chat 으로 graph 재조회. */
  chatId: number;
  /** 부모 chat 의 branchPoint turnId — UI 가 이 위치에 핸들을 그린다. */
  branchPointTurnId: number;
  /** 자식 chat 의 lastTurnId. 핸들 클릭 시 centerTurnId 우선 후보 (§3.1 collapsed 규칙 1). */
  childLastTurnId: number | null;
}

/**
 * 명세 §3.1 collapsed branch 계산 규칙.
 *
 * 백엔드는 collapsed 정보를 별도 필드로 내려주지 않는다(응답 단순화). 클라이언트가
 * `chats[]` 와 `turns[]` 의 차집합으로 계산한다:
 *  - 어떤 자식 chat 의 branchPointTurnId 는 `turns[]` 에 있는데
 *  - 그 자식 chat 의 `turnSequence === 1` 인 turn 이 `turns[]` 에 없는 경우
 *  → 그 분기는 window 밖에 있음 → "접힌 분기" 핸들 표시.
 */
export function useCollapsedBranches(
  graphData: GraphResponse | undefined,
): CollapsedBranch[] {
  return useMemo(() => {
    if (!graphData) return [];

    const turnsById = new Set(graphData.turns.map(t => t.turnId));
    const firstTurnIdByChat = new Map<number, number>();
    for (const turn of graphData.turns) {
      if (turn.turnSequence === 1) {
        firstTurnIdByChat.set(turn.chatId, turn.turnId);
      }
    }

    const collapsed: CollapsedBranch[] = [];
    for (const chat of graphData.chats) {
      if (chat.parentChatId === null) continue; // 루트 chat 은 분기점 없음
      if (chat.branchPointTurnId == null) continue;
      if (!turnsById.has(chat.branchPointTurnId)) continue; // 분기점이 window 안에 있어야 핸들을 그릴 수 있음
      if (firstTurnIdByChat.has(chat.chatId)) continue; // 자식의 첫 turn 이 window 안에 있으면 펼쳐진 상태

      collapsed.push({
        chatId: chat.chatId,
        branchPointTurnId: chat.branchPointTurnId,
        childLastTurnId: chat.lastTurnId,
      });
    }
    return collapsed;
  }, [graphData]);
}
