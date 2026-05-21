export type TitleStatus = 'PENDING' | 'GENERATED' | 'USER_EDITED';

export interface Branch {
  id: string;
  parentConvId: string;
  title: string;
  forkAtTurnIndex: number;
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
