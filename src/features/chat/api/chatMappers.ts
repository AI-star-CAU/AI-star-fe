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

/**
 * 명세 §2.4: MessageDto 에는 chatId 가 없으므로(부모 turn/chat 에 포함)
 * 호출 측이 path 로 알고 있는 chatId 를 주입한다.
 */
export function mapMessageResponseToMessage(
  response: ChatMessageResponse,
  chatId: string,
): Message {
  return {
    id: String(response.messageId),
    conversationId: chatId,
    role: mapSenderTypeToRole(response.senderType),
    // 명세 §2.4: 취소/실패 시 content 가 null 일 수 있다.
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
    turn.messages.map(m => mapMessageResponseToMessage(m, chatId)),
  );
}
