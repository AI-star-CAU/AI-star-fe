import { apiClient } from '../../../shared/api/client';
import { ENDPOINTS } from '../../../shared/api/endpoints';
import {
  mapChatListItemToConversation,
  mapTurnListToMessages,
} from './chatMappers';
import type {
  CancelMessageResponse,
  ChatListItemResponse,
  ChatMetaResponse,
  Conversation,
  CreateChatRequest,
  CreateChatResponse,
  Message,
  TurnListItemResponse,
  TurnPageParams,
  TurnPageResponse,
} from '../types';

/**
 * 명세 §2.1: llmProvider / llmModel 은 필수 필드다. 모델 선택 UI 가
 * 아직 없어 명세 enum 의 첫 옵션을 기본값으로 사용한다. UI 가 생기면
 * createChat() 인자로 override 한다.
 */
const DEFAULT_CHAT_OPTIONS = {
  llmProvider: 'OPENAI',
  llmModel: 'gpt-4o-mini',
} as const satisfies Pick<CreateChatRequest, 'llmProvider' | 'llmModel'>;

interface ApiEnvelope<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

/**
 * 명세 §0.1: Offset/Cursor 페이지네이션을 사용한다. 목록 응답이
 * 배열로 바로 오거나 `{ content: [...] }` / `{ items: [...] }` 형태로
 * 감싸여 올 수 있어, 어느 쪽이든 배열만 추출한다.
 */
function unwrapList<T>(result: unknown): T[] {
  if (Array.isArray(result)) return result as T[];
  if (result && typeof result === 'object') {
    const obj = result as Record<string, unknown>;
    for (const key of ['content', 'items', 'list', 'turns', 'chats']) {
      if (Array.isArray(obj[key])) return obj[key] as T[];
    }
  }
  return [];
}

export const chatApi = {
  async getConversations(): Promise<Conversation[]> {
    const res = await apiClient.get<ApiEnvelope<unknown>>(ENDPOINTS.chat.list);
    return unwrapList<ChatListItemResponse>(res.result).map(
      mapChatListItemToConversation,
    );
  },

  /** 명세 §2.3: 대화 메타정보(제목/모델 등)만 조회. 턴은 미포함. */
  async getChatMeta(chatId: number): Promise<ChatMetaResponse> {
    const res = await apiClient.get<ApiEnvelope<ChatMetaResponse>>(
      ENDPOINTS.chat.detail(chatId),
    );
    return res.result;
  },

  /**
   * 명세 §2.4: cursor 기반 턴 페이지 조회.
   * 첫 호출은 lastTurnSequence 생략(direction=BACKWARD → 최신 limit턴).
   * 응답의 nextTurnSequence/hasMore 로 다음 페이지를 잇는다.
   */
  async getTurnsPage(
    chatId: number,
    params: TurnPageParams = {},
  ): Promise<TurnPageResponse> {
    const query = new URLSearchParams();
    if (params.lastTurnSequence != null) {
      query.set('lastTurnSequence', String(params.lastTurnSequence));
    }
    query.set('limit', String(params.limit ?? 20));
    query.set('direction', params.direction ?? 'BACKWARD');

    const res = await apiClient.get<ApiEnvelope<unknown>>(
      `${ENDPOINTS.chat.turns(chatId)}?${query.toString()}`,
    );
    const result = (res.result ?? {}) as Partial<TurnPageResponse>;
    return {
      turns: unwrapList<TurnListItemResponse>(res.result),
      nextTurnSequence: result.nextTurnSequence ?? null,
      hasMore: result.hasMore ?? false,
    };
  },

  /**
   * 첫 진입 편의 메서드: 최신 한 페이지(20턴)를 메시지 배열로 평탄화.
   * 무한 스크롤이 필요하면 getTurnsPage 를 직접 사용한다.
   */
  async getMessages(convOrBranchId: string): Promise<Message[]> {
    // 'new'는 아직 백엔드에 존재하지 않는 임시 화면 상태.
    if (convOrBranchId === 'new') return [];
    const chatId = Number(convOrBranchId);
    if (!Number.isFinite(chatId)) return [];

    const page = await chatApi.getTurnsPage(chatId, {
      direction: 'BACKWARD',
    });
    return mapTurnListToMessages(page.turns, String(chatId));
  },

  /**
   * 명세 §0.2.1 / §2.1: "대화 생성 + 첫 메시지" 2단계 패턴.
   * 'new' 화면에서 첫 메시지를 보내기 전에 chat 을 먼저 생성한다.
   * llmProvider / llmModel 은 명세 §2.1 필수 필드이므로 반드시 포함한다
   * (누락 시 400 COMMON_4001). title 은 선택(미지정 시 서버가 "제목없음").
   */
  async createChat(
    options?: Partial<CreateChatRequest>,
  ): Promise<number> {
    const body: CreateChatRequest = {
      ...DEFAULT_CHAT_OPTIONS,
      ...options,
    };
    const res = await apiClient.post<ApiEnvelope<CreateChatResponse>>(
      ENDPOINTS.chat.create,
      body,
    );
    return res.result.chatId;
  },

  /**
   * 명세 §2.6: 스트리밍 중 assistant 메시지 생성 취소.
   * CANCELED 는 idempotent(200). COMPLETED/FAILED 는 409 MESSAGE_4091.
   */
  async cancelMessage(
    chatId: number,
    messageId: number,
  ): Promise<CancelMessageResponse> {
    const res = await apiClient.post<ApiEnvelope<CancelMessageResponse>>(
      ENDPOINTS.chat.cancelMessage(chatId, messageId),
    );
    return res.result;
  },

  /** 명세 §2.7: 대화 소프트 삭제 (Phase 2 보조 기능). */
  async deleteChat(chatId: number): Promise<void> {
    await apiClient.delete<ApiEnvelope<null>>(
      ENDPOINTS.chat.delete(chatId),
    );
  },
};
