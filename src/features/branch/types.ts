export interface Branch {
  id: string;
  parentConvId: string;
  title: string;
  forkAtTurnIndex: number;
}

export type NodeAction =
  | { type: 'scroll'; messageId: string; chatId?: string }
  | { type: 'navigate'; chatId: string };
