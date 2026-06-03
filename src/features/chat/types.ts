import type { Branch } from '../branch/types';

export type MessageRole = 'user' | 'assistant';
export type SenderType = 'USER' | 'ASSISTANT';

/** 명세 §2.4 MessageDto.status (FR-1.3). */
export type MessageStatus = 'STREAMING' | 'COMPLETED' | 'CANCELED' | 'FAILED';

/** 명세 §2.1 요청 본문 enum. */
export type LlmProvider = 'LOCAL' | 'OPENAI' | 'GOOGLE' | 'ANTHROPIC';
export type LlmModel =
  | 'local-default'
  | 'gpt-4o-mini'
  | 'gemini-2.0-flash'
  | 'claude-3.5-sonnet';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  /** 명세 §2.4: CANCELED/FAILED 시 부분 텍스트 + 종료 상태 구분용. */
  status?: MessageStatus;
  isPending?: boolean;
  turnId?: number;
}

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  createdAt: string;
  turnCount: number;
  lastMessageAt?: string | null;
  llmProvider?: string;
  llmModel?: string;
  branches: Branch[];
}

export interface ChatListItemResponse {
  chatId: number;
  title: string | null;
  lastMessagePreview: string | null;
  turnCount: number;
  lastMessageAt: string | null;
  llmProvider: string;
  llmModel: string;
  createdAt: string;
  updatedAt: string;
}

/** 명세 §2.1 요청 본문. title 은 선택, provider/model 은 필수. */
export interface CreateChatRequest {
  title?: string;
  llmProvider: LlmProvider;
  llmModel: LlmModel;
}

/** 명세 §2.1 응답 result. */
export interface CreateChatResponse {
  chatId: number;
  rootChatId: number;
  parentId: number | null;
  branchPointTurnId?: number | null;
  title: string | null;
  titleStatus?: 'PENDING' | 'GENERATED' | 'USER_EDITED';
  llmProvider: LlmProvider;
  llmModel: LlmModel;
  createdAt: string;
  updatedAt: string;
}

/** 명세 §2.4 + Phase 3 §8: chatId 필드 추가 (분기 화면에서 원본 chat 식별용). */
export interface ChatMessageResponse {
  messageId: number;
  chatId?: number;
  senderType: SenderType;
  status: MessageStatus;
  content: string | null;
  promptToken: number | null;
  answerToken: number | null;
  createdAt: string;
}

/** 명세 §2.3 대화 메타정보 응답. §2.1 응답과 동일 스키마. */
export type ChatMetaResponse = CreateChatResponse;

/** 명세 §2.4 TurnDto. (chatId 는 path 로 알고 있어 미응답) */
export interface TurnListItemResponse {
  turnId: number;
  turnSequence: number;
  summary: string | null;
  summaryStatus?: 'PENDING' | 'GENERATED';
  messages: ChatMessageResponse[];
  createdAt: string;
}

/** 명세 §2.4 cursor 페이징 응답 result. */
export interface TurnPageResponse {
  turns: TurnListItemResponse[];
  nextTurnSequence: number | null;
  hasMore: boolean;
}

export type TurnDirection = 'BACKWARD' | 'FORWARD';

export interface TurnPageParams {
  lastTurnSequence?: number;
  limit?: number;
  direction?: TurnDirection;
}

/** 명세 §2.6 응답 취소 result. */
export interface CancelMessageResponse {
  messageId: number;
  status: MessageStatus;
  content: string | null;
  answerToken: number | null;
}
