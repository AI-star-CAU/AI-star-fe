import type { AuthLoginProvider, User } from '../types';

const MOCK_USER: User = {
  id: 'u1',
  name: '정주원',
  email: '02juw@cau.ac.kr',
  plan: 'free',
};

const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

export const authApi = {
  async login(provider: AuthLoginProvider): Promise<User> {
    void provider;
    await delay(400);
    return MOCK_USER;
  },

  async logout(): Promise<void> {
    await delay(100);
  },
};
