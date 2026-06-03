import { apiClient } from '../../../shared/api/client';
import { ENDPOINTS } from '../../../shared/api/endpoints';
import { apiEnvelope } from '../../../shared/api/schemas';
import { ExplorerPageSchema, ExplorerTreeSchema } from './schemas';
import type { ExplorerPage, ExplorerPageParams, ExplorerTree } from '../types';

export const explorerApi = {
  /** Phase 4 §2.1: 탐색기 트리(페이징된 root + 하위 분기 평탄 배열) 조회. */
  async getExplorerPage(params: ExplorerPageParams = {}): Promise<ExplorerPage> {
    const search = new URLSearchParams();
    search.set('sort', params.sort ?? 'recent');
    search.set('page', String(params.page ?? 0));
    search.set('size', String(params.size ?? 20));
    search.set('includeDeleted', String(params.includeDeleted ?? false));

    const raw = await apiClient.get<unknown>(
      `${ENDPOINTS.explorer.tree}?${search.toString()}`,
    );
    const parsed = apiEnvelope(ExplorerPageSchema).parse(raw);
    return parsed.result as ExplorerPage;
  },

  /** Phase 4 §2.2(선택): 단일 root 트리 새로고침. */
  async getExplorerTree(
    rootChatId: number,
    includeDeleted = false,
  ): Promise<ExplorerTree> {
    const search = new URLSearchParams();
    search.set('includeDeleted', String(includeDeleted));
    const raw = await apiClient.get<unknown>(
      `${ENDPOINTS.explorer.singleTree(rootChatId)}?${search.toString()}`,
    );
    const parsed = apiEnvelope(ExplorerTreeSchema).parse(raw);
    return parsed.result as ExplorerTree;
  },
};
