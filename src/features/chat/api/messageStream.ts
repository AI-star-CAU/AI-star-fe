import { env } from '../../../shared/config/env';
import { STORAGE_KEYS } from '../../../shared/constants/storageKeys';
import { ApiError } from '../../../shared/api/client';
import { ENDPOINTS } from '../../../shared/api/endpoints';

/**
 * 명세 §2.5 메시지 송신(SSE) 이벤트 스키마.
 * terminal event 는 turn_completed | error | cancelled 중 정확히 하나이며,
 * 그 뒤 반드시 done 이 온다.
 */
export interface TurnStartedData {
  turnId: number;
  userMessageId: number;
  aiMessageId: number;
}

export interface ChunkData {
  text: string;
}

/** 명세 §2.5: {aiMessageId, summary, answerToken} */
export interface TurnCompletedData {
  aiMessageId: number;
  summary: string;
  answerToken?: number;
}

/** 명세 §2.5: {aiMessageId, status:"CANCELED", content?, answerToken?} */
export interface CancelledData {
  aiMessageId: number;
  status: 'CANCELED';
  content?: string;
  answerToken?: number;
}

export interface StreamHandlers {
  onTurnStarted?: (d: TurnStartedData) => void;
  onChunk?: (d: ChunkData) => void;
  onTurnCompleted?: (d: TurnCompletedData) => void;
  onCancelled?: (d: CancelledData) => void;
}

interface SseEvent {
  event: string;
  data: string;
}

/** `event:`/`data:` 블록(빈 줄 구분)을 파싱한다. data 는 여러 줄일 수 있다. */
function parseSseBlock(block: string): SseEvent | null {
  let event = 'message';
  const dataLines: string[] = [];
  for (const rawLine of block.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    if (line.startsWith(':')) continue; // SSE 주석
    const idx = line.indexOf(':');
    const field = idx === -1 ? line : line.slice(0, idx);
    const value = idx === -1 ? '' : line.slice(idx + 1).replace(/^ /, '');
    if (field === 'event') event = value;
    else if (field === 'data') dataLines.push(value);
  }
  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join('\n') };
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

  // 스트리밍 시작 전 에러는 ApiResponse JSON 으로 온다.
  if (!res.ok || !res.body) {
    const errBody = await res.json().catch(() => undefined);
    const message =
      (errBody && typeof errBody === 'object' && 'message' in errBody
        ? String((errBody as { message: unknown }).message)
        : res.statusText) || '메시지 전송에 실패했습니다.';
    throw new ApiError(res.status, message, errBody);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  const handleEvent = (evt: SseEvent) => {
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
          d,
        );
      }
      // 'done' 및 그 외 이벤트는 무시 (루프 종료는 done/EOF 로 처리)
    }
  };

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sep: number;
    // 이벤트는 빈 줄(\n\n)로 구분된다. CRLF 도 허용.
    while ((sep = buffer.search(/\r?\n\r?\n/)) !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + buffer.match(/\r?\n\r?\n/)![0].length);
      const evt = parseSseBlock(block);
      if (!evt) continue;
      if (evt.event === 'done') return;
      handleEvent(evt);
    }
  }

  // 스트림이 done 없이 끝난 경우 남은 버퍼 처리
  const tail = parseSseBlock(buffer);
  if (tail && tail.event !== 'done') handleEvent(tail);
}
