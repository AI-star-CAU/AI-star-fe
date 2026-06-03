import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { branchApi } from '../api/branchApi';
import type { CreateBranchResponse, UpdateBranchRequest } from '../types';

/**
 * 분기 제목 수정 mutation hook (PATCH /chats/{chatId}).
 * 성공 시 ['conversations'] 캐시를 무효화한다.
 * 실패 시의 UX(제목 rollback 등)는 호출 측이 처리하도록 에러를 그대로 전파한다.
 */
export function useUpdateBranch() {
  const queryClient = useQueryClient();

  const updateBranch = useCallback(
    async (
      branchId: number,
      body: UpdateBranchRequest,
    ): Promise<CreateBranchResponse> => {
      const result = await branchApi.updateBranch(branchId, body);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      return result;
    },
    [queryClient],
  );

  return { updateBranch };
}
