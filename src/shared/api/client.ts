import { env } from '../config/env';
import { readAuthToken } from '../storage/tokenStorage';
import { ApiError } from './ApiError';
import { parseHttpError } from './parseHttpError';

// 외부에서 기존처럼 `from '../shared/api/client'` 로 ApiError 를 가져올 수 있게 재노출.
export { ApiError };

type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: unknown;
  auth?: boolean;
};

function buildHeaders(options: RequestOptions): HeadersInit {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (options.auth !== false) {
    const token = readAuthToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }
  return headers;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, auth, ...rest } = options;
  void auth;
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    ...rest,
    headers: buildHeaders(options),
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    throw await parseHttpError(response, '요청이 실패했어요.');
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
