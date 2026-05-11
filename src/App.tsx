import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import LoginPage from './pages/LoginPage';
import ChatPage from './pages/ChatPage';
import MyPage from './pages/MyPage';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* 공개 라우트: 로그인된 상태면 /chat 으로 리다이렉트 */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<LoginPage />} />
          </Route>

          {/* 보호된 라우트: 미인증 시 / 로 리다이렉트 */}
          <Route element={<ProtectedRoute />}>
            {/* /chat 진입 시 기본 대화(c1)로 리다이렉트 */}
            <Route path="/chat" element={<Navigate to="/chat/new" replace />} />
            {/* URL에 대화 ID 포함 — useParams 로 읽음 */}
            <Route path="/chat/:convId" element={<ChatPage />} />
            <Route path="/mypage" element={<MyPage />} />
          </Route>

          {/* 정의되지 않은 경로는 루트로 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
