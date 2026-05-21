import { env } from '../config/env';
import { STORAGE_KEYS } from '../constants/storageKeys';
import { parseHttpError } from './parseHttpError';

export interface SSEEvent {
  event: string;
  data: string;
}

type SseMethod = 'POST' | 'PATCH';

function parseSseBlock(block: string): SSEEvent | null {
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

  const reader = response.body.getReader();
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
