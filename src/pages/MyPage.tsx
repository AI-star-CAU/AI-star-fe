import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useConversations } from '../features/chat/hooks/useConversations';
import Button from '../shared/components/ui/Button';
import { TIME } from '../shared/utils/date';
import ProfileCard from '../features/user/components/ProfileCard';
import PlanCard from '../features/user/components/PlanCard';
import StatCard from '../features/user/components/StatCard';
import UsageMeter from '../features/user/components/UsageMeter';
import RecentConversations from '../features/user/components/RecentConversations';
import DangerZone from '../features/user/components/DangerZone';
import DeleteAccountModal from '../features/user/components/DeleteAccountModal';
import { PATHS } from '../app/router/routes';

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, deleteAccount } = useAuth();
  const { data: conversations = [], isLoading: convsLoading } = useConversations();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const updateNow = () => setNow(Date.now());

    updateNow();
    const intervalId = window.setInterval(updateNow, TIME.MINUTE_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  const stats = useMemo(() => ({
    totalConversations: conversations.length,
    totalBranches: conversations.reduce((sum, c) => sum + c.branches.length, 0),
    totalTurns: conversations.reduce((sum, c) => sum + c.turnCount, 0),
  }), [conversations]);

  const recentConversations = useMemo(
    () =>
      [...conversations]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [conversations],
  );

  const handleDeleteAccount = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    setDeleteError(null);
    try {
      // 명세 §1.3: DELETE /members/me 실호출 후 세션 정리.
      await deleteAccount();
      navigate(PATHS.LOGIN);
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : '계정 삭제에 실패했습니다.',
      );
      setIsDeleting(false);
    }
  };

  const plan = user?.plan ?? 'free';

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-5 sticky top-0 z-40">
        <Link
          to={PATHS.CHAT}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-semibold"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          대화로 돌아가기
        </Link>

        <Link to={PATHS.CHAT} className="text-xl font-black tracking-tight hover:opacity-80 transition">
          <span className="text-gradient-blue">A</span>IT
        </Link>

        <Button
          onClick={() => { logout(); navigate(PATHS.LOGIN); }}
          variant="custom"
          size="sm"
          className="text-slate-500 hover:text-red-400 px-0 py-0"
        >
          로그아웃
        </Button>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-black mb-8 text-white">마이페이지</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <ProfileCard user={user} />
            <PlanCard plan={plan} />
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <p className="section-label mb-3">사용 현황</p>
              <div className="grid grid-cols-3 gap-4">
                <StatCard
                  label="총 대화"
                  value={stats.totalConversations}
                  sub="개의 루트 대화"
                  loading={convsLoading}
                />
                <StatCard
                  label="총 분기"
                  value={stats.totalBranches}
                  sub="개의 분기 생성"
                  loading={convsLoading}
                />
                <StatCard
                  label="총 턴"
                  value={stats.totalTurns}
                  sub="번의 대화"
                  loading={convsLoading}
                />
              </div>
            </div>

            <UsageMeter plan={plan} />

            <RecentConversations
              conversations={recentConversations}
              isLoading={convsLoading}
              now={now}
            />

            <DangerZone onRequestDelete={() => setShowDeleteModal(true)} />
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={isDeleting}
          error={deleteError}
        />
      )}
    </div>
  );
};

export default MyPage;
