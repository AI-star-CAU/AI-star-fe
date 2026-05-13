import { ApiError } from '../../../shared/api/client';

interface ApiErrorBody {
  message?: string;
  code?: string;
}

const FALLBACK_BY_STATUS: Record<number, string> = {
  400: '입력값이 올바르지 않습니다.',
  401: '이메일 또는 비밀번호가 일치하지 않습니다.',
  409: '이미 존재하는 이메일입니다.',
};

export function extractAuthErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    const body = error.body as ApiErrorBody | undefined;
    if (body?.message) return body.message;
    const fallback = FALLBACK_BY_STATUS[error.status];
    if (fallback) return fallback;
  }
  return '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
}
