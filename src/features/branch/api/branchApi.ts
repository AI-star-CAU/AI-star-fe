import { apiClient } from '../../../shared/api/client';
import { ENDPOINTS } from '../../../shared/api/endpoints';
import type { CreateBranchRequest, CreateBranchResponse, ExpandGraphResponse, GraphResponse, UpdateBranchRequest } from '../types';

interface ApiEnvelope<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

export const branchApi = {
  async createBranch(chatId: number, body: CreateBranchRequest): Promise<CreateBranchResponse> {
    const res = await apiClient.post<ApiEnvelope<CreateBranchResponse>>(
      ENDPOINTS.branch.create(chatId),
      body,
    );
    return res.result;
  },

  async updateBranch(chatId: number, body: UpdateBranchRequest): Promise<CreateBranchResponse> {
    const res = await apiClient.patch<ApiEnvelope<CreateBranchResponse>>(
      ENDPOINTS.branch.update(chatId),
      body,
    );
    return res.result;
  },

  async deleteBranch(chatId: number): Promise<void> {
    await apiClient.delete<ApiEnvelope<null>>(ENDPOINTS.branch.delete(chatId));
  },

  async restoreBranch(chatId: number): Promise<CreateBranchResponse> {
    const res = await apiClient.post<ApiEnvelope<CreateBranchResponse>>(
      ENDPOINTS.branch.restore(chatId),
    );
    return res.result;
  },

  async expandGraph(
    chatId: number,
    params: { fromTurnId: number; direction: 'UP' | 'DOWN'; limit?: number; includeDeleted?: boolean },
  ): Promise<ExpandGraphResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('fromTurnId', String(params.fromTurnId));
    searchParams.set('direction', params.direction);
    if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
    if (params.includeDeleted !== undefined) searchParams.set('includeDeleted', String(params.includeDeleted));
    const res = await apiClient.get<ApiEnvelope<ExpandGraphResponse>>(
      `${ENDPOINTS.branch.graphExpand(chatId)}?${searchParams.toString()}`,
    );
    return res.result;
  },

  async getGraph(
    chatId: number,
    params?: { centerTurnId?: number; up?: number; down?: number; includeDeleted?: boolean },
  ): Promise<GraphResponse> {
    const searchParams = new URLSearchParams();
    if (params?.centerTurnId !== undefined) searchParams.set('centerTurnId', String(params.centerTurnId));
    if (params?.up !== undefined) searchParams.set('up', String(params.up));
    if (params?.down !== undefined) searchParams.set('down', String(params.down));
    if (params?.includeDeleted !== undefined) searchParams.set('includeDeleted', String(params.includeDeleted));
    const query = searchParams.toString();
    const res = await apiClient.get<ApiEnvelope<GraphResponse>>(
      `${ENDPOINTS.branch.graph(chatId)}${query ? `?${query}` : ''}`,
    );
    return res.result;
  },
};
