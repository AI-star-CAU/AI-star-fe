/**
 * BE 명세 §0.3: 모든 에러도 ApiResponse<T> 래퍼.
 * `code` 는 BE 의 타입화된 에러 코드(`AUTH_4013`, `LLM_5001` 등)로,
 * 코드별 분기(자동 로그아웃, 사용자 메시지 매핑)에 사용된다.
 */
export class ApiError extends Error {
  status: number;
  code: string | null;
  body?: unknown;

  constructor(status: number, message: string, code: string | null, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}
