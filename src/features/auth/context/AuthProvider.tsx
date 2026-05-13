import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { AuthContext, INITIAL_AUTH_STATE, authReducer } from './AuthContext';
import { authApi } from '../api/authApi';
import {
  clearAuthToken,
  clearSavedUser,
  readSavedUser,
  saveAuthToken,
  saveUser,
} from '../utils/authStorage';
import {
  mapAuthResponseToUser,
  type AuthResponse,
  type LoginCredentials,
  type SignupCredentials,
} from '../types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, INITIAL_AUTH_STATE);

  useEffect(() => {
    dispatch({ type: 'RESTORE', user: readSavedUser() });
  }, []);

  const acceptAuthResponse = useCallback((response: AuthResponse) => {
    const user = mapAuthResponseToUser(response);
    saveAuthToken(response.accessToken);
    saveUser(user);
    dispatch({ type: 'LOGIN', user });
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await authApi.login(credentials);
      acceptAuthResponse(response);
    },
    [acceptAuthResponse],
  );

  const signup = useCallback(
    async (credentials: SignupCredentials) => {
      const response = await authApi.signup(credentials);
      acceptAuthResponse(response);
    },
    [acceptAuthResponse],
  );

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    clearSavedUser();
    clearAuthToken();
    void authApi.logout();
  }, []);

  const value = useMemo(
    () => ({ ...state, login, signup, logout }),
    [state, login, signup, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
