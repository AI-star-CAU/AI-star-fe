export interface Branch {
  id: string;
  parentConvId: string;
  title: string;
  forkAtTurnIndex: number;
}

export type NodeAction =
  | { type: 'turn'; turnId: number; chatId: string; turnSequence?: number }
  | { type: 'navigate'; chatId: string };

export type TitleStatus = 'PENDING' | 'GENERATED' | 'USER_EDITED';
export type SummaryStatus = 'PENDING' | 'GENERATED';

export interface ChatNodeDto {
  chatId: number;
  title: string | null;
  titleStatus: TitleStatus;
  parentChatId: number | null;
  branchPointTurnId: number | null;
  depth: number;
  isDeleted: boolean;
  lastTurnId: number | null;
  updatedAt: string;
}

export interface TurnNodeDto {
  turnId: number;
  chatId: number;
  turnSequence: number;
  summary: string | null;
  summaryStatus: SummaryStatus;
  isBranchPoint: boolean;
  isCurrent: boolean;
  createdAt: string;
}

export interface FrontierPoint {
  fromTurnId: number;
  hasMore: boolean;
}

export interface FrontierDto {
  up: FrontierPoint[];
  down: FrontierPoint[];
}

export interface CenterDto {
  turnId: number;
  chatId: number;
}

export interface GraphResponse {
  rootChatId: number;
  center: CenterDto | null;
  chats: ChatNodeDto[];
  turns: TurnNodeDto[];
  frontier: FrontierDto;
}

export interface ExpandGraphResponse {
  direction: 'UP' | 'DOWN';
  turns: TurnNodeDto[];
  frontier: FrontierDto;
}

export interface UpdateBranchRequest {
  title: string;
}

export interface CreateBranchRequest {
  branchPointTurnId: number;
  title?: string | null;
}

export interface CreateBranchResponse {
  chatId: number;
  rootChatId: number;
  parentId: number;
  branchPointTurnId: number;
  title: string | null;
  titleStatus: TitleStatus;
  llmProvider: string;
  llmModel: string;
  createdAt: string;
  updatedAt: string;
}
