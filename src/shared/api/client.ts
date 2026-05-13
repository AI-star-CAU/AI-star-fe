import { env } from '../config/env';
import { STORAGE_KEYS } from '../constants/storageKeys';

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

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
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
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
    const errorBody = await response.json().catch(() => undefined);
    throw new ApiError(response.status, response.statusText, errorBody);
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
