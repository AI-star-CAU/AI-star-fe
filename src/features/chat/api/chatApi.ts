import { MOCK_CONVERSATIONS } from '../../../mocks/conversations';
import { MOCK_MESSAGES } from '../../../mocks/messages';
import type { Branch } from '../../branch/types';
import type { Conversation, Message } from '../types';

const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

export function findBranchById(id: string): Branch | undefined {
  for (const conv of MOCK_CONVERSATIONS) {
    const branch = conv.branches.find(b => b.id === id);
    if (branch) return branch;
  }
  return undefined;
}

export function isKnownId(id: string): boolean {
  if (id === 'new') return true;
  if (MOCK_CONVERSATIONS.some(c => c.id === id)) return true;
  return !!findBranchById(id);
}

export const chatApi = {
  async getConversations(): Promise<Conversation[]> {
    await delay(600);
    return MOCK_CONVERSATIONS;
  },

  async getMessages(convOrBranchId: string): Promise<Message[]> {
    await delay(400);
    if (convOrBranchId === 'new') return [];
    return MOCK_MESSAGES[convOrBranchId] ?? [
      {
        id: `default-${convOrBranchId}`,
        conversationId: convOrBranchId,
        role: 'assistant',
        content: '새 대화를 시작합니다. 무엇이든 물어보세요!',
        createdAt: new Date().toISOString(),
      },
    ];
  },

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    void content;
    await delay(1200);
    return {
      id: `ai-${Date.now()}`,
      conversationId,
      role: 'assistant',
      content: '백엔드가 아직 연결되지 않았습니다. API 연결 후 실제 응답이 표시됩니다.',
      createdAt: new Date().toISOString(),
    };
  },
};
