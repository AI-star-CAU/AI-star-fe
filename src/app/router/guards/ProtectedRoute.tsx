import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { PATHS } from '../routes';

const LoadingScreen: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <span className="nm-mini-mast" style={{ fontSize: 32 }}>
        AIT
      </span>
      <span
        style={{
          fontFamily: 'var(--type)',
          fontSize: 10,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
        }}
      >
        — Going to press —
      </span>
      <div className="flex gap-1.5">
        {[0, 150, 300].map(d => (
          <span
            key={d}
            className="w-2 h-2 rounded-full animate-bounce"
            style={{ background: 'var(--red)', animationDelay: `${d}ms` }}
          />
        ))}
      </div>
    </div>
  </div>
);

const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <LoadingScreen />;

  if (!user) {
    return <Navigate to={PATHS.LOGIN} state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
