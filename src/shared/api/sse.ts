import { env } from '../config/env';
import { STORAGE_KEYS } from '../constants/storageKeys';

export interface SSEEvent {
  event: string;
  data: string;
}

export async function* streamSSE(path: string, body?: unknown): AsyncGenerator<SSEEvent> {
  const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok || !response.body) {
    throw new Error(`SSE request failed: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      let event = 'message';
      let data = '';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          event = line.slice(7).trim();
        } else if (line.startsWith('data: ')) {
          data = line.slice(6).trim();
        } else if (line === '') {
          if (data) {
            yield { event, data };
            event = 'message';
            data = '';
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
