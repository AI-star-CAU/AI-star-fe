import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { branchApi } from '../api/branchApi';
import { ApiError } from '../../../shared/api/client';
import { resolveErrorMessage } from '../../../shared/api/errorCodes';
import { showToast } from '../../../shared/utils/toastEvents';
import { chatPath } from '../../../app/router/routes';
import type { CreateBranchResponse } from '../types';

interface UseCreateBranchOptions {
  onCreated?: (result: CreateBranchResponse) => void;
}

/**
 * 명세 §2.1 (Phase 3): POST /chats/{chatId}/branches
 * chatId 는 분기점 turn 이 실제로 속한 chat 의 id 여야 한다 (BRANCH_4001 방지).
 */
export function useCreateBranch(options?: UseCreateBranchOptions) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const createBranch = useCallback(async (
    turnId: number,
    originChatId: string,
  ) => {
    const numericChatId = Number(originChatId);
    if (isNaN(numericChatId)) return;

    setIsCreating(true);
    try {
      const result = await branchApi.createBranch(numericChatId, {
        branchPointTurnId: turnId,
        title: null,
      });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['graph'] });
      options?.onCreated?.(result);
      navigate(chatPath(String(result.chatId)));
    } catch (err) {
      showToast(
        'error',
        err instanceof ApiError
          ? resolveErrorMessage(err.code, err.message)
          : '분기 생성에 실패했어요. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      setIsCreating(false);
    }
  }, [navigate, queryClient, options]);

  return { createBranch, isCreating };
}
