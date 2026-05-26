/**
 * BE 명세 §0.3: 모든 응답은 ApiResponse<T> 단일 래퍼.
 *  - 성공 시 `result` 에 실제 데이터가 들어온다.
 *  - 실패 시 `result: null`, `code` 에 에러 코드.
 *
 * 본 타입은 client.ts 의 에러 파싱과 각 feature 의 zod 스키마(`apiEnvelope`)에서 공통으로 사용한다.
 */
export interface ApiResponse<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}
