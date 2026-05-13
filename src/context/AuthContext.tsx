import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { User } from '../api/ait';

interface AuthState {
  user: User | null;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'LOGIN'; user: User }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE'; user: User | null };

interface AuthContextValue extends AuthState {
  login: (provider: 'google' | 'github' | 'email') => Promise<void>;
  logout: () => void;
}

const MOCK_USER: User = {
  id: 'u1',
  name: '정주원',
  email: '02juw@cau.ac.kr',
  plan: 'free',
};

const AuthContext = createContext<AuthContextValue | null>(null);

function authReducer(state: AuthState, action: AuthAction): AuthState {
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, { user: null, isLoading: true });

  useEffect(() => {
    const saved = localStorage.getItem('ait_user');
    dispatch({ type: 'RESTORE', user: saved ? (JSON.parse(saved) as User) : null });
  }, []);

  const login = async (_provider: 'google' | 'github' | 'email') => {
    // TODO: real OAuth flow
    dispatch({ type: 'LOGIN', user: MOCK_USER });
    localStorage.setItem('ait_user', JSON.stringify(MOCK_USER));
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('ait_user');
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
