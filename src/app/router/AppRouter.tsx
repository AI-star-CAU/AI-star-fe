import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './guards/ProtectedRoute';
import PublicRoute from './guards/PublicRoute';
import LoginPage from '../../pages/LoginPage';
import ChatLayout from '../../pages/chat/ChatLayout';
import MyPage from '../../pages/MyPage';
import SettingsPage from '../../pages/SettingsPage';
import { PATHS } from './routes';

const AppRouter: React.FC = () => (
  <Routes>
    <Route element={<PublicRoute />}>
      <Route path={PATHS.LOGIN} element={<LoginPage />} />
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route path={PATHS.CHAT} element={<Navigate to={PATHS.CHAT_NEW} replace />} />
      <Route path={PATHS.CHAT_DETAIL} element={<ChatLayout />} />
      <Route path={PATHS.MY_PAGE} element={<MyPage />} />
      <Route path={PATHS.SETTINGS} element={<SettingsPage />} />
    </Route>

    <Route path="*" element={<Navigate to={PATHS.LOGIN} replace />} />
  </Routes>
);

export default AppRouter;
