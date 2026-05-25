import type {
  ChatListItemResponse,
  ChatMessageResponse,
  Conversation,
  Message,
  MessageRole,
  SenderType,
  TurnListItemResponse,
} from '../types';

export function mapSenderTypeToRole(senderType: SenderType): MessageRole {
  return senderType === 'USER' ? 'user' : 'assistant';
}

export function mapRoleToSenderType(role: MessageRole): SenderType {
  return role === 'user' ? 'USER' : 'ASSISTANT';
}

export function mapChatListItemToConversation(item: ChatListItemResponse): Conversation {
  return {
    id: String(item.chatId),
    title: item.title ?? '제목없음',
    preview: item.lastMessagePreview ?? '아직 메시지가 없습니다.',
    createdAt: item.createdAt,
    turnCount: item.turnCount,
    lastMessageAt: item.lastMessageAt,
    llmProvider: item.llmProvider,
    llmModel: item.llmModel,
    branches: [],
  };
}

/**
 * 명세 §2.4 + Phase 3 §8: 메시지 자체의 chatId 를 우선 사용하고,
 * 없으면 path 로 알고 있는 chatId 를 주입한다.
 */
export function mapMessageResponseToMessage(
  response: ChatMessageResponse,
  chatId: string,
): Message {
  return {
    id: String(response.messageId),
    conversationId: response.chatId ? String(response.chatId) : chatId,
    role: mapSenderTypeToRole(response.senderType),
    content: response.content ?? '',
    status: response.status,
    createdAt: response.createdAt,
  };
}

export function mapTurnListToMessages(
  turns: TurnListItemResponse[],
  chatId: string,
): Message[] {
  return turns.flatMap(turn =>
    turn.messages.map(msg => ({
      ...mapMessageResponseToMessage(msg, chatId),
      turnId: turn.turnId,
    })),
  );
}
