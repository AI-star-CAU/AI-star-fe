import type { GraphResponse } from '../../graph/types';

export interface TurnSummaryInfo {
  /** UI 에 그릴 텍스트. PENDING 이면 placeholder. */
  display: string;
  isPending: boolean;
}

const PENDING_PLACEHOLDER = '요약 생성 중…';
const NO_SUMMARY_FALLBACK = '';

/**
 * 명세 §2.4 + Phase 3 §0.5 원칙 3.
 *
 * 그래프 응답의 turn 노드에서 summary 를 꺼내 UI 친화 형태로 반환한다.
 *  - summaryStatus === 'PENDING' → "요약 생성 중…" placeholder
 *  - summary 있음 → 그대로
 *
 * 폴링은 useGraph 가 자동으로 처리한다.
 */
export function useTurnSummary(
  turnId: number | null | undefined,
  graphData: GraphResponse | undefined,
): TurnSummaryInfo {
  if (turnId == null || !graphData) {
    return { display: NO_SUMMARY_FALLBACK, isPending: false };
  }

  const turn = graphData.turns.find(t => t.turnId === turnId);
  if (!turn) {
    return { display: NO_SUMMARY_FALLBACK, isPending: false };
  }

  if (turn.summaryStatus === 'PENDING') {
    return { display: PENDING_PLACEHOLDER, isPending: true };
  }

  return {
    display: turn.summary ?? NO_SUMMARY_FALLBACK,
    isPending: false,
  };
}
