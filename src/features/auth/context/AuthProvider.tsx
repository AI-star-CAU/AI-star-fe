import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { AuthContext, INITIAL_AUTH_STATE, authReducer } from './AuthContext';
import { authApi } from '../api/authApi';
import { clearSavedUser, readSavedUser, saveUser } from '../utils/authStorage';
import type { AuthLoginProvider } from '../types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, INITIAL_AUTH_STATE);

  useEffect(() => {
    dispatch({ type: 'RESTORE', user: readSavedUser() });
  }, []);

  const login = useCallback(async (provider: AuthLoginProvider) => {
    const user = await authApi.login(provider);
    dispatch({ type: 'LOGIN', user });
    saveUser(user);
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    clearSavedUser();
    void authApi.logout();
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
