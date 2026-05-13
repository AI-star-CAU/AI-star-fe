import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { PATHS } from '../routes';

const PublicRoute: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (user) {
    return <Navigate to={PATHS.CHAT_NEW} replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
