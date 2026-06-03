import { env } from '../config/env';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { parseHttpError } from './parseHttpError';

export interface SSEEvent {
  event: string;
  data: string;
}

type SseMethod = 'POST' | 'PATCH';

/**
 * `event:`/`data:` 블록(빈 줄 구분)을 파싱한다. data 는 여러 줄일 수 있으며,
 * `:` 로 시작하는 주석 줄은 무시한다. 데이터가 없는 블록은 null 을 반환한다.
 */
export function parseSseBlock(block: string): SSEEvent | null {
  let event = 'message';
  const dataLines: string[] = [];

  for (const rawLine of block.split('\n')) {
    const line = rawLine.replace(/\r$/, '');
    if (!line || line.startsWith(':')) continue;
    const idx = line.indexOf(':');
    const field = idx === -1 ? line : line.slice(0, idx);
    const value = idx === -1 ? '' : line.slice(idx + 1).replace(/^ /, '');
    if (field === 'event') event = value;
    if (field === 'data') dataLines.push(value);
  }

  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join('\n') };
}

/**
 * Response body reader 를 빈 줄(\n\n, CRLF 허용)로 끊어 SSEEvent 를 순서대로 방출한다.
 * 스트림이 done 없이 끝나도 남은 버퍼(tail)를 마지막으로 파싱한다.
 * 공통 SSE 파서/스트림 처리 — feature 는 이 위에서 event 매핑만 담당한다.
 */
export async function* parseSseStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
): AsyncGenerator<SSEEvent> {
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let sep: number;
      while ((sep = buffer.search(/\r?\n\r?\n/)) !== -1) {
        const block = buffer.slice(0, sep);
        const separator = buffer.match(/\r?\n\r?\n/)?.[0] ?? '\n\n';
        buffer = buffer.slice(sep + separator.length);
        const parsed = parseSseBlock(block);
        if (parsed) yield parsed;
      }
    }

    const tail = parseSseBlock(buffer);
    if (tail) yield tail;
  } finally {
    reader.releaseLock();
  }
}

export async function* streamSSE(
  path: string,
  body?: unknown,
  method: SseMethod = 'POST',
): AsyncGenerator<SSEEvent> {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    headers: {
      Accept: 'text/event-stream',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  // 스트리밍 시작 전 에러는 ApiResponse JSON 으로 온다 (명세 §2.5).
  if (!response.ok || !response.body) {
    throw await parseHttpError(response, 'SSE 요청에 실패했어요.');
  }

  yield* parseSseStream(response.body.getReader());
}
