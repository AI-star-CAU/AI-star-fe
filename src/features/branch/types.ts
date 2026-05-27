export type TitleStatus = 'PENDING' | 'GENERATED' | 'USER_EDITED';

export interface Branch {
  id: string;
  parentConvId: string;
  title: string;
  forkAtTurnIndex: number;
  /** Phase 4 §2.1: 탐색기 트리 깊이(root 직속 분기는 1). 사이드바 들여쓰기용. */
  depth?: number;
  /** Phase 4 §2.1: 부모 chat 에서 분기된 turn id. forkAtTurnIndex 재계산용. */
  branchPointTurnId?: number | null;
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
