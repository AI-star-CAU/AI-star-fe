import { apiClient } from '../../../shared/api/client';
import { ENDPOINTS } from '../../../shared/api/endpoints';
import type { AuthResponse, LoginCredentials, SignupCredentials } from '../types';

interface ApiEnvelope<T> {
  isSuccess: boolean;
  code: string;
  message: string;
  result: T;
}

export const authApi = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await apiClient.post<ApiEnvelope<AuthResponse>>(
      ENDPOINTS.auth.login,
      credentials,
      { auth: false },
    );
    return res.result;
  },

  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    const res = await apiClient.post<ApiEnvelope<AuthResponse>>(
      ENDPOINTS.auth.signup,
      credentials,
      { auth: false },
    );
    return res.result;
  },

  async logout(): Promise<void> {
    await apiClient.post<ApiEnvelope<null>>(ENDPOINTS.auth.logout).catch(() => undefined);
  },
};
