import { apiClient } from '../../../shared/api/client';
import { ENDPOINTS } from '../../../shared/api/endpoints';
import {
  mapChatListItemToConversation,
  mapTurnListToMessages,
} from './chatMappers';
import { apiEnvelope, pageResponseSchema } from '../../../shared/api/schemas';
import {
  CancelMessageResponseSchema,
  ChatListItemResponseSchema,
  CreateChatResponseSchema,
  TurnPageResponseSchema,
} from './schemas';
import type {
  CancelMessageResponse,
  ChatMetaResponse,
  Conversation,
  CreateChatRequest,
  Message,
  TurnPageParams,
  TurnPageResponse,
} from '../types';

const DEFAULT_CHAT_OPTIONS = {
  llmProvider: 'OPENAI',
  llmModel: 'gpt-4o-mini',
} as const satisfies Pick<CreateChatRequest, 'llmProvider' | 'llmModel'>;

export const chatApi = {
  async getConversations(): Promise<Conversation[]> {
    const raw = await apiClient.get<unknown>(ENDPOINTS.chat.list);
    const parsed = apiEnvelope(
      ChatListItemResponseSchema.array().or(pageResponseSchema(ChatListItemResponseSchema)),
    ).parse(raw);
    const items = Array.isArray(parsed.result) ? parsed.result : parsed.result.content;
    return items.map(mapChatListItemToConversation);
  },

  /** 명세 §2.3: 대화 메타정보(제목/모델 등)만 조회. 턴은 미포함. */
  async getChatMeta(chatId: number): Promise<ChatMetaResponse> {
    const raw = await apiClient.get<unknown>(ENDPOINTS.chat.detail(chatId));
    const parsed = apiEnvelope(CreateChatResponseSchema).parse(raw);
    return parsed.result;
  },

  /** 명세 §2.4: cursor 기반 턴 페이지 조회. */
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

    const raw = await apiClient.get<unknown>(
      `${ENDPOINTS.chat.turns(chatId)}?${query.toString()}`,
    );
    const parsed = apiEnvelope(TurnPageResponseSchema).parse(raw);
    return parsed.result;
  },

  async getMessages(convOrBranchId: string): Promise<Message[]> {
    if (convOrBranchId === 'new') return [];
    const chatId = Number(convOrBranchId);
    if (!Number.isFinite(chatId)) return [];

    const page = await chatApi.getTurnsPage(chatId, { direction: 'BACKWARD' });
    return mapTurnListToMessages(page.turns, String(chatId));
  },

  /**
   * 명세 §0.2.1 / §2.1: "대화 생성 + 첫 메시지" 2단계 패턴.
   * llmProvider / llmModel 은 명세 §2.1 필수 필드이므로 반드시 포함한다.
   */
  async createChat(options?: Partial<CreateChatRequest>): Promise<number> {
    const body: CreateChatRequest = { ...DEFAULT_CHAT_OPTIONS, ...options };
    const raw = await apiClient.post<unknown>(ENDPOINTS.chat.create, body);
    const parsed = apiEnvelope(CreateChatResponseSchema).parse(raw);
    return parsed.result.chatId;
  },

  /** 명세 §2.6: 스트리밍 중 assistant 메시지 생성 취소. */
  async cancelMessage(
    chatId: number,
    messageId: number,
  ): Promise<CancelMessageResponse> {
    const raw = await apiClient.post<unknown>(
      ENDPOINTS.chat.cancelMessage(chatId, messageId),
    );
    const parsed = apiEnvelope(CancelMessageResponseSchema).parse(raw);
    return parsed.result;
  },

  /** 명세 §2.7: 대화 소프트 삭제. */
  async deleteChat(chatId: number): Promise<void> {
    await apiClient.delete<unknown>(ENDPOINTS.chat.delete(chatId));
  },
};
