import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <span className="text-3xl font-black text-white tracking-tight">
        <span className="text-cyan-300">A</span>IT
      </span>
      <div className="flex gap-1.5">
        {[0, 150, 300].map(d => (
          <span
            key={d}
            className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
            style={{ animationDelay: `${d}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
);

/**
 * 레이아웃 라우트 패턴: 인증된 사용자만 자식 라우트에 접근 가능.
 * 미인증 시 현재 경로를 state.from 에 담아 로그인 페이지로 redirect.
 * 인증 복원 중(isLoading)에는 로딩 화면을 표시해 flash 방지.
 */
const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
