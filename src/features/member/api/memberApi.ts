import { apiClient } from '../../../shared/api/client';
import { ENDPOINTS } from '../../../shared/api/endpoints';
import type { MemberMeResponse } from '../../auth/types';

interface ApiEnvelope<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

export const memberApi = {
  /** 명세 §1.4: 내 정보 조회 (인증 필요). */
  async getMe(): Promise<MemberMeResponse> {
    const res = await apiClient.get<ApiEnvelope<MemberMeResponse>>(
      ENDPOINTS.member.me,
    );
    return res.result;
  },

  /** 명세 §1.3: 회원 탈퇴 (소프트 삭제, 200 + result null). */
  async deleteMe(): Promise<void> {
    await apiClient.delete<ApiEnvelope<null>>(ENDPOINTS.member.me);
  },
};
