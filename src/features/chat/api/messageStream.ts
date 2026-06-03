import { env } from '../../../shared/config/env';
import { STORAGE_KEYS } from '../../../shared/constants/storageKeys';
import { ApiError } from '../../../shared/api/client';
import { parseHttpError } from '../../../shared/api/parseHttpError';
import { ENDPOINTS } from '../../../shared/api/endpoints';
import { parseSseStream, type SSEEvent } from '../../../shared/api/sse';
import type {
  TurnStartedData,
  ChunkData,
  TurnCompletedData,
  CancelledData,
} from './streamTypes';

export type { TurnStartedData, ChunkData, TurnCompletedData, CancelledData };

export interface StreamHandlers {
  onTurnStarted?: (d: TurnStartedData) => void;
  onChunk?: (d: ChunkData) => void;
  onTurnCompleted?: (d: TurnCompletedData) => void;
  onCancelled?: (d: CancelledData) => void;
}

function safeJson<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * POST /api/v1/chats/{chatId}/messages 를 SSE 로 소비한다 (명세 §2.5).
 * - 스트리밍 시작 전 에러: HTTP 4xx/5xx + ApiResponse JSON → ApiError throw
 * - 스트리밍 중 에러: SSE `event: error` → ApiError throw (retryable 포함)
 * - 취소: SSE `event: cancelled` → onCancelled 호출 (부분 content 보존)
 * done 이벤트 수신 시 정상 종료.
 *
 * 공통 SSE 파서/스트림 처리는 shared/api/sse 의 parseSseStream 에 위임하고,
 * 여기서는 chat 전용 event → handler 매핑만 담당한다.
 */
export async function streamMessage(
  chatId: number,
  content: string,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const res = await fetch(
    `${env.apiBaseUrl}${ENDPOINTS.chat.messages(chatId)}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content }),
      signal,
    },
  );

  // 스트리밍 시작 전 에러는 ApiResponse JSON 으로 온다 (명세 §2.5).
  if (!res.ok || !res.body) {
    throw await parseHttpError(res, '메시지 전송에 실패했어요.');
  }

  const handleEvent = (evt: SSEEvent) => {
    switch (evt.event) {
      case 'turn_started': {
        const d = safeJson<TurnStartedData>(evt.data);
        if (d) handlers.onTurnStarted?.(d);
        break;
      }
      case 'chunk': {
        const d = safeJson<ChunkData>(evt.data);
        if (d) handlers.onChunk?.(d);
        break;
      }
      case 'turn_completed': {
        const d = safeJson<TurnCompletedData>(evt.data);
        if (d) handlers.onTurnCompleted?.(d);
        break;
      }
      case 'cancelled': {
        const d = safeJson<CancelledData>(evt.data);
        if (d) handlers.onCancelled?.(d);
        break;
      }
      case 'error': {
        const d = safeJson<{
          code?: string;
          message?: string;
          retryable?: boolean;
        }>(evt.data);
        throw new ApiError(
          500,
          d?.message ?? 'LLM 응답 생성 중 오류가 발생했습니다.',
          d?.code ?? null,
          d,
        );
      }
      // 'done' 및 그 외 이벤트는 무시 (루프 종료는 done/EOF 로 처리)
    }
  };

  for await (const evt of parseSseStream(res.body.getReader())) {
    if (evt.event === 'done') return;
    handleEvent(evt);
  }
}
