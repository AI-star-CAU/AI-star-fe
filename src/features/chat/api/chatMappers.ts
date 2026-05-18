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
    title: item.title,
    preview: item.lastMessagePreview ?? '아직 메시지가 없습니다.',
    createdAt: item.createdAt,
    turnCount: item.turnCount,
    lastMessageAt: item.lastMessageAt,
    llmProvider: item.llmProvider,
    llmModel: item.llmModel,
    branches: [],
  };
}

export function mapMessageResponseToMessage(response: ChatMessageResponse): Message {
  return {
    id: String(response.messageId),
    conversationId: String(response.chatId),
    role: mapSenderTypeToRole(response.senderType),
    content: response.content,
    createdAt: response.createdAt,
  };
}

export function mapTurnListToMessages(turns: TurnListItemResponse[]): Message[] {
  return turns.flatMap(turn =>
    turn.messages.map(msg => ({
      ...mapMessageResponseToMessage(msg),
      turnId: turn.turnId,
    }))
  );
}
