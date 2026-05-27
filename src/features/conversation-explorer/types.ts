import type { TitleStatus } from '../branch/types';
import type { LlmModel, LlmProvider } from '../chat/types';

/** Phase 4 §2.1 탐색기 정렬 기준. */
export type ExplorerSort = 'recent' | 'created' | 'name';

/** Phase 4 §2.1 ExplorerNodeDto — 루트 포함 모든 chat 의 평탄화 노드. */
export interface ExplorerNode {
  chatId: number;
  parentChatId: number | null;
  branchPointTurnId: number | null;
  title: string | null;
  titleStatus: TitleStatus;
  depth: number;
  turnCount: number;
  lastActivityAt: string;
  createdAt: string;
  deletedAt: string | null;
  llmProvider: LlmProvider;
  llmModel: LlmModel;
}

/** Phase 4 §2.1 ExplorerTreeDto — root chat 한 그루의 DFS 평탄 배열. */
export interface ExplorerTree {
  rootChatId: number;
  nodes: ExplorerNode[];
}

/** Phase 4 §2.1 탐색기 페이지 응답. */
export interface ExplorerPage {
  roots: ExplorerTree[];
  page: number;
  size: number;
  totalRootCount: number;
  hasNext: boolean;
}

export interface ExplorerPageParams {
  sort?: ExplorerSort;
  page?: number;
  size?: number;
  includeDeleted?: boolean;
}
