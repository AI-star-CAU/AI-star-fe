import { clearAuthToken } from '../../storage/tokenStorage';
import { clearAuthUser } from '../../storage/userStorage';
import { AUTH_BROKEN_CODES } from '../errorCodes';
import type { ApiError } from '../ApiError';

/**
 * 401 응답을 어떻게 다룰지 결정한다.
 *
 *  - `AUTH_4011`(무효 토큰) / `AUTH_4013`(만료) → 세션이 깨진 상태이므로
 *    로컬 토큰·유저 정보를 정리하고 로그인 화면으로 보낸다.
 *  - 그 외 401(예: `AUTH_4012` 로그인 실패)는 호출자가 직접 다룬다.
 *
 * SPA 라우터 컨텍스트 밖(인터셉터)에서 동작하므로 `location.href` 로 강제 이동한다.
 * 이미 로그인 화면이면 리다이렉트를 건너뛴다 (무한 새로고침 방지).
 */
export function handleAuthBroken(error: ApiError): boolean {
  if (error.status !== 401) return false;
  if (!error.code || !AUTH_BROKEN_CODES.has(error.code)) return false;

  clearAuthToken();
  clearAuthUser();

  const alreadyOnLogin =
    typeof window !== 'undefined' && window.location.pathname === '/';

  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('app:toast', {
        detail: { type: 'error', message: '로그인 세션이 만료되었어요. 다시 로그인해 주세요.' },
      }),
    );
    if (!alreadyOnLogin) {
      window.location.href = '/';
    }
  }
  return true;
}
