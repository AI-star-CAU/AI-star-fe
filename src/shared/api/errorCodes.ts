/**
 * BE 명세 §0.5 + Phase 3 §0.2 에러 코드 → 사용자 친화 메시지 매핑.
 *
 * 매핑이 없는 코드는 BE 가 내려준 `message` 를 그대로 쓰되,
 * 가능한 모든 코드를 여기서 한 번에 관리한다.
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // 공통
  COMMON_400: '잘못된 요청이에요.',
  COMMON_4001: '입력값이 올바르지 않아요.',
  COMMON_403: '접근 권한이 없어요.',
  COMMON_404: '요청한 정보를 찾을 수 없어요.',
  COMMON_500: '일시적인 서버 오류가 발생했어요. 잠시 후 다시 시도해 주세요.',

  // 인증
  AUTH_4011: '인증이 만료되었어요. 다시 로그인해 주세요.',
  AUTH_4012: '이메일 또는 비밀번호가 일치하지 않아요.',
  AUTH_4013: '로그인 세션이 만료되었어요. 다시 로그인해 주세요.',

  // 멤버
  MEMBER_4041: '존재하지 않는 회원이에요.',
  MEMBER_4091: '이미 가입된 이메일이에요.',

  // 대화
  CHAT_4041: '존재하지 않는 대화예요.',
  MESSAGE_4041: '존재하지 않는 메시지예요.',
  MESSAGE_4091: '이미 완료되었거나 취소할 수 없는 메시지예요.',
  MESSAGE_4092: '수정하거나 재생성할 수 없는 메시지예요.',

  // 분기 / 그래프
  BRANCH_4001: '이 지점에서는 분기를 만들 수 없어요.',
  BRANCH_4041: '존재하지 않는 분기예요.',
  BRANCH_4091: '이미 삭제된 분기예요.',
  GRAPH_4001: '그래프 조회 조건이 올바르지 않아요.',
  TURN_4041: '해당 대화 턴을 찾을 수 없어요.',

  // LLM
  LLM_5001: 'AI 응답 생성에 실패했어요. 잠시 후 다시 시도해 주세요.',
};

/**
 * 우선 매핑된 사용자 메시지, 없으면 BE 가 내려준 원본 message 를 사용.
 * 둘 다 없으면 일반 fallback.
 */
export function resolveErrorMessage(
  code: string | null | undefined,
  beMessage: string | null | undefined,
): string {
  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  if (beMessage) return beMessage;
  return '요청 처리 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.';
}

/** 인증이 깨진 상태(자동 로그아웃 + 로그인 리다이렉트 대상). */
export const AUTH_BROKEN_CODES = new Set(['AUTH_4011', 'AUTH_4013']);
