import { useQuery } from '@tanstack/react-query';
import { usageApi } from '../api/usageApi';
import { ApiError } from '../../../shared/api/client';

/**
 * Phase 4 §3.3 토큰 사용량 조회.
 *
 * SSE `turn_completed`(§3.4) 이후 `['usage']` 무효화로 갱신된다.
 * plan 이 없는 사용자는 404 `USAGE_4041` 을 반환하므로 재시도하지 않는다.
 */
export const useUsage = () =>
  useQuery({
    queryKey: ['usage'],
    queryFn: usageApi.getMyUsage,
    staleTime: 1000 * 30,
    retry: (failureCount, error) => {
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < 1;
    },
  });
