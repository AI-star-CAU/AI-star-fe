/**
 * 채팅 SSE 스트림 공통 이벤트 타입 (Phase 3 §4.1 기준).
 *
 * 사용처:
 *  - messageStream.ts  (Phase 2 §2.5 send message)
 *  - useRegenerate.ts  (Phase 3 §4.1 regenerate — branch 생성 없음)
 *  - useEditMessage.ts (Phase 3 §4.2 edit — branch_created 포함)
 */

/** Phase 3 §4.1: chatId 필드 추가. send/edit 에서는 optional. */
export interface TurnStartedData {
  chatId?: number;
  turnId: number;
  userMessageId: number;
  aiMessageId: number;
}

export interface ChunkData {
  text: string;
}

/**
 * Phase 3 §4.1: summary 제거, summaryStatus 추가.
 * Phase 4 §3.4: 맥락 압축 결과 3필드 추가(서버가 압축을 적용한 경우에만 의미 있음).
 */
export interface TurnCompletedData {
  turnId: number;
  aiMessageId: number;
  answerToken: number;
  summaryStatus: 'PENDING';
  /** Phase 4: 압축 적용 후 LLM 에 실제 전달된 입력 토큰 수. */
  contextTokens?: number;
  /** Phase 4: 압축(summary 치환 또는 truncation)이 1턴 이상 적용됐는지. */
  compressionApplied?: boolean;
  /** Phase 4: 본 호출에서 압축된 turn 수. compressionApplied=false 이면 0. */
  compressedTurnCount?: number;
}

/** 취소 이벤트 (Phase 2 §2.5, send message 전용). */
export interface CancelledData {
  aiMessageId: number;
  status: 'CANCELED';
  content?: string;
  answerToken?: number;
}

/** Phase 3 §4.2 edit message 전용. regenerate 에서는 전송되지 않음(§0.7). */
export interface BranchCreatedData {
  newChatId: number;
  branchPointTurnId: number;
  title: string | null;
  titleStatus: 'PENDING' | 'GENERATED' | 'USER_EDITED';
}

export interface StreamErrorData {
  code?: string;
  message?: string;
  retryable?: boolean;
}

export function parseEventData<T>(data: string): T | null {
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}
