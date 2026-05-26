import { ApiError } from './ApiError';
import { handleAuthBroken } from './interceptors/authInterceptor';

interface ApiResponseErrorBody {
  isSuccess?: boolean;
  code?: unknown;
  message?: unknown;
  result?: unknown;
}

/**
 * not-ok Response 를 BE 의 `ApiResponse<T>` (§0.3) 규약대로 파싱해서
 * `ApiError({status, message, code, body})` 를 만든다.
 *
 * 또한 401 + AUTH_4011/AUTH_4013 케이스에 대한 글로벌 처리(localStorage 정리 + 리다이렉트)도
 * 함께 호출하므로, 호출자는 throw 만 하면 된다.
 *
 * - client.ts (일반 JSON API)
 * - messageStream.ts (SSE 시작 전 에러)
 * - sse.ts (범용 SSE)
 *
 * 위 3 곳에서 동일한 파싱·인터셉터 호출을 하기 위해 추출했다.
 */
export async function parseHttpError(res: Response, fallbackMessage: string): Promise<ApiError> {
  const body = (await res.json().catch(() => undefined)) as ApiResponseErrorBody | undefined;

  const code = typeof body?.code === 'string' ? body.code : null;
  const message =
    typeof body?.message === 'string' && body.message.length > 0
      ? body.message
      : (res.statusText || fallbackMessage);

  const error = new ApiError(res.status, message, code, body);
  handleAuthBroken(error);
  return error;
}
