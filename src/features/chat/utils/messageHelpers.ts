import type { Message } from '../types';

export function getMessagesThroughFork(messages: Message[], forkAtTurnIndex: number): Message[] {
  const prefixMessages: Message[] = [];
  let userTurnCount = 0;

  for (const message of messages) {
    if (message.role === 'user') {
      userTurnCount += 1;
      if (userTurnCount > forkAtTurnIndex) break;
    }

    prefixMessages.push(message);
  }

  return prefixMessages;
}

export function removePreTurnAssistantMessages(messages: Message[]): Message[] {
  const firstUserMessageIndex = messages.findIndex(message => message.role === 'user');
  if (firstUserMessageIndex < 0) return [];
  return messages.slice(firstUserMessageIndex);
}
