import { apiClient } from '../../../shared/api/client';
import { ENDPOINTS } from '../../../shared/api/endpoints';
import {
  apiEnvelope,
  CreateBranchResponseSchema,
  ExpandGraphResponseSchema,
  GraphResponseSchema,
} from './schemas';
import type { CreateBranchRequest, CreateBranchResponse, ExpandGraphResponse, GraphResponse, UpdateBranchRequest } from '../types';

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

  async expandGraph(
    chatId: number,
    params: { fromTurnId: number; direction: 'UP' | 'DOWN'; limit?: number; includeDeleted?: boolean },
  ): Promise<ExpandGraphResponse> {
    const searchParams = new URLSearchParams();
    searchParams.set('fromTurnId', String(params.fromTurnId));
    searchParams.set('direction', params.direction);
    if (params.limit !== undefined) searchParams.set('limit', String(params.limit));
    if (params.includeDeleted !== undefined) searchParams.set('includeDeleted', String(params.includeDeleted));
    const raw = await apiClient.get<unknown>(
      `${ENDPOINTS.branch.graphExpand(chatId)}?${searchParams.toString()}`,
    );
    const parsed = apiEnvelope(ExpandGraphResponseSchema).parse(raw);
    return parsed.result;
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
    const raw = await apiClient.get<unknown>(
      `${ENDPOINTS.branch.graph(chatId)}${query ? `?${query}` : ''}`,
    );
    const parsed = apiEnvelope(GraphResponseSchema).parse(raw);
    return parsed.result;
  },
};
