import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import type { User } from '../api/ait';
import {
  AUTH_STORAGE_KEY,
  AuthContext,
  INITIAL_AUTH_STATE,
  MOCK_USER,
  authReducer,
  type AuthLoginProvider,
} from './auth';

function readSavedUser(): User | null {
  const saved = localStorage.getItem(AUTH_STORAGE_KEY);
  if (!saved) return null;

  try {
    return JSON.parse(saved) as User;
  } catch {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, INITIAL_AUTH_STATE);

  useEffect(() => {
    dispatch({ type: 'RESTORE', user: readSavedUser() });
  }, []);

  const login = useCallback(async (provider: AuthLoginProvider) => {
    void provider;
    dispatch({ type: 'LOGIN', user: MOCK_USER });
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(MOCK_USER));
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem(AUTH_STORAGE_KEY);
  }, []);

  const value = useMemo(
    () => ({ ...state, login, logout }),
    [state, login, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
