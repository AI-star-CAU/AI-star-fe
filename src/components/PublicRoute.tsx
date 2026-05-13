import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * 레이아웃 라우트 패턴: 이미 로그인된 사용자가 공개 페이지(로그인 등)에
 * 접근하면 /chat 으로 redirect. 인증 복원 중에는 아무것도 렌더하지 않아
 * 불필요한 flash 방지.
 */
const PublicRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    return <Navigate to="/chat/new" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
