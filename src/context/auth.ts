import { createContext } from 'react';
import type { User } from '../api/ait';

export type AuthLoginProvider = 'google' | 'github' | 'email';

export interface AuthState {
  user: User | null;
  isLoading: boolean;
}

export type AuthAction =
  | { type: 'LOGIN'; user: User }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE'; user: User | null };

export interface AuthContextValue extends AuthState {
  login: (provider: AuthLoginProvider) => Promise<void>;
  logout: () => void;
}

export const AUTH_STORAGE_KEY = 'ait_user';

export const INITIAL_AUTH_STATE: AuthState = {
  user: null,
  isLoading: true,
};

export const MOCK_USER: User = {
  id: 'u1',
  name: '정주원',
  email: '02juw@cau.ac.kr',
  plan: 'free',
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.user, isLoading: false };
    case 'LOGOUT':
      return { user: null, isLoading: false };
    case 'RESTORE':
      return { user: action.user, isLoading: false };
    default:
      return state;
  }
}
