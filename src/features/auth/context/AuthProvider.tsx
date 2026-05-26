import React, { useCallback, useEffect, useMemo, useReducer } from 'react';
import { AuthContext, INITIAL_AUTH_STATE, authReducer } from './AuthContext';
import { authApi } from '../api/authApi';
import { memberApi } from '../../member/api/memberApi';
import {
  clearAuthToken,
  clearSavedUser,
  readSavedUser,
  saveAuthToken,
  saveUser,
} from '../utils/authStorage';
import {
  mapAuthResponseToUser,
  mapMemberMeToUser,
  type AuthResponse,
  type LoginCredentials,
  type SignupCredentials,
} from '../types';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, INITIAL_AUTH_STATE);

  // 새로고침 시 localStorage 에 저장된 토큰/유저로 세션 복원.
  // token 은 client.ts 에서 localStorage 로부터 직접 읽어 Authorization 헤더에 붙인다.
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
  }, []);

  // 명세 §1.4: 서버 최신 내 정보로 동기화.
  const refreshMe = useCallback(async () => {
    const user = mapMemberMeToUser(await memberApi.getMe());
    saveUser(user);
    dispatch({ type: 'RESTORE', user });
  }, []);

  // 명세 §1.3: 회원 탈퇴 후 로컬 세션 정리.
  const deleteAccount = useCallback(async () => {
    await memberApi.deleteMe();
    dispatch({ type: 'LOGOUT' });
    clearSavedUser();
    clearAuthToken();
  }, []);

  const value = useMemo(
    () => ({ ...state, login, signup, logout, refreshMe, deleteAccount }),
    [state, login, signup, logout, refreshMe, deleteAccount],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
