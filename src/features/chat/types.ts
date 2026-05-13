import type { Branch } from '../branch/types';

export type MessageRole = 'user' | 'assistant';
export type SenderType = 'USER' | 'ASSISTANT';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  isPending?: boolean;
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
  title: string;
  lastMessagePreview: string | null;
  turnCount: number;
  lastMessageAt: string | null;
  llmProvider: string;
  llmModel: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessageResponse {
  messageId: number;
  chatId: number;
  senderType: SenderType;
  content: string;
  createdAt: string;
}

export interface TurnListItemResponse {
  turnId: number;
  chatId: number;
  turnSequence: number;
  messages: ChatMessageResponse[];
  createdAt: string;
}
