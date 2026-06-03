import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { branchApi } from '../api/branchApi';

/**
 * 분기 삭제 mutation hook (DELETE /chats/{chatId}).
 * 성공 시 ['conversations'] 캐시를 무효화한다.
 * 실패 시의 UX(confirming 상태 해제 등)는 호출 측이 처리하도록 에러를 그대로 전파한다.
 */
export function useDeleteBranch() {
  const queryClient = useQueryClient();

  const deleteBranch = useCallback(
    async (branchId: number): Promise<void> => {
      await branchApi.deleteBranch(branchId);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    [queryClient],
  );

  return { deleteBranch };
}
