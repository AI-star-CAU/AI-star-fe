import { apiClient } from '../../../shared/api/client';
import { ENDPOINTS } from '../../../shared/api/endpoints';
import { apiEnvelope } from '../../../shared/api/schemas';
import { UsageInfoSchema } from './schemas';
import type { UsageInfo } from '../types';

export const usageApi = {
  /** Phase 4 §3.3: 현재 활성 기간의 토큰 사용량 조회. */
  async getMyUsage(): Promise<UsageInfo> {
    const raw = await apiClient.get<unknown>(ENDPOINTS.usage.me);
    const parsed = apiEnvelope(UsageInfoSchema).parse(raw);
    return parsed.result;
  },
};
