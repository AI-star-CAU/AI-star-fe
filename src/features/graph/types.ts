import type { TitleStatus } from '../branch/types';

export type SummaryStatus = 'PENDING' | 'GENERATED';

export type GraphViewMode = 'structure' | 'focused';

export type NodeAction =
  | { type: 'turn'; turnId: number; chatId: string; turnSequence?: number }
  | { type: 'navigate'; chatId: string };

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
