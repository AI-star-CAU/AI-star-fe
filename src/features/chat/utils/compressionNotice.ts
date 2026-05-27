import { showToast } from '../../../shared/utils/toastEvents';
import type { TurnCompletedData } from '../api/streamTypes';

/**
 * Phase 4 §3.2 / §5.2: 서버가 긴 대화 맥락을 압축한 경우 사용자에게 안내한다.
 * 압축은 정상 동작이므로 info 토스트로만 알린다(에러 아님).
 */
export function notifyCompression(d: TurnCompletedData): void {
  if (!d.compressionApplied) return;
  const count = d.compressedTurnCount ?? 0;
  showToast(
    'info',
    count > 0
      ? `긴 대화라 오래된 맥락 ${count}개를 요약·압축해 응답했어요.`
      : '긴 대화라 오래된 맥락을 압축해 응답했어요.',
  );
}
