import { apiClient } from '../../../shared/api/client';
import { ENDPOINTS } from '../../../shared/api/endpoints';
import { apiEnvelope, CreateBranchResponseSchema } from './schemas';
import type { CreateBranchRequest, CreateBranchResponse, UpdateBranchRequest } from '../types';

export const branchApi = {
  async createBranch(chatId: number, body: CreateBranchRequest): Promise<CreateBranchResponse> {
    const raw = await apiClient.post<unknown>(ENDPOINTS.branch.create(chatId), body);
    const parsed = apiEnvelope(CreateBranchResponseSchema).parse(raw);
    return parsed.result;
  },

  async updateBranch(chatId: number, body: UpdateBranchRequest): Promise<CreateBranchResponse> {
    const raw = await apiClient.patch<unknown>(ENDPOINTS.branch.update(chatId), body);
    const parsed = apiEnvelope(CreateBranchResponseSchema).parse(raw);
    return parsed.result;
  },

  async deleteBranch(chatId: number): Promise<void> {
    await apiClient.delete<unknown>(ENDPOINTS.branch.delete(chatId));
  },

  async restoreBranch(chatId: number): Promise<CreateBranchResponse> {
    const raw = await apiClient.post<unknown>(ENDPOINTS.branch.restore(chatId));
    const parsed = apiEnvelope(CreateBranchResponseSchema).parse(raw);
    return parsed.result;
  },
};
