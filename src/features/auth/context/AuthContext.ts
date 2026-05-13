import { createContext } from 'react';
import type { AuthContextValue, AuthState, AuthAction } from '../types';

export const INITIAL_AUTH_STATE: AuthState = {
  user: null,
  isLoading: true,
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
