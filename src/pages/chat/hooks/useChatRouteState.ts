import { useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';

/**
 * 채팅 라우트 상태: 활성 대화 id, turnId 검색 파라미터, 도달 후 정리 핸들러.
 * (ChatLayout 에서 추출 — 동작 동일)
 */
export function useChatRouteState() {
  const { convId } = useParams<{ convId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeConvId = convId ?? 'new';
  const targetTurnId = useMemo(() => {
    const raw = searchParams.get('turnId');
    if (!raw) return undefined;
    const n = Number(raw);
    return Number.isFinite(n) ? n : undefined;
  }, [searchParams]);

  const handleTargetTurnReached = useCallback(() => {
    setSearchParams(current => {
      const next = new URLSearchParams(current);
      next.delete('turnId');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  return { activeConvId, targetTurnId, handleTargetTurnReached };
}
