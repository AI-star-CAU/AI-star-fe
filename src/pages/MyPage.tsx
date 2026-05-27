import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useConversations } from '../features/conversation-explorer/hooks/useConversations';
import { TIME } from '../shared/utils/date';
import ProfileCard from '../features/member/components/ProfileCard';
import PlanCard from '../features/member/components/PlanCard';
import StatCard from '../features/member/components/StatCard';
import UsageMeter from '../features/member/components/UsageMeter';
import RecentConversations from '../features/member/components/RecentConversations';
import DangerZone from '../features/member/components/DangerZone';
import DeleteAccountModal from '../features/member/components/DeleteAccountModal';
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
    <div className="min-h-screen">
      <header
        className="h-14 flex items-center justify-between px-5 sticky top-0 z-40"
        style={{
          background: 'var(--paper-card)',
          borderBottom: '1px solid var(--rule)',
        }}
      >
        <Link
          to={PATHS.CHAT}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--ink-2)',
            fontFamily: 'var(--type)',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          ◂ 대화로 돌아가기
        </Link>

        <Link to={PATHS.CHAT} className="nm-mini-mast hover:opacity-80 transition">
          AIT
        </Link>

        <button
          type="button"
          onClick={() => { logout(); navigate(PATHS.LOGIN); }}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--red-deep)',
            fontFamily: 'var(--type)',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}
        >
          구독 해지
        </button>
      </header>

      <header className="nm-masthead">
        <div className="nm-mast-top">
          <span>READER'S DESK</span>
          <span>{new Date().toLocaleDateString('ko-KR')}</span>
          <span className="nm-mast-badge">SUBSCRIBER · {plan.toUpperCase()}</span>
        </div>
        <h1 className="nm-mast-name">
          <span className="the">The</span>AIT<span className="pulse" />Times
        </h1>
        <div className="nm-mast-tagline">— 독자 카드 · Profile of a Subscriber —</div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <ProfileCard user={user} />

        <div className="nm-ornament" style={{ margin: '22px 0' }}>❦</div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
          <div className="space-y-4">
            <span className="nm-kicker">CIRCULATION · 이번 달 발행 통계</span>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                border: '1.5px solid var(--ink)',
              }}
            >
              <StatCard
                label="발행한 호"
                value={stats.totalConversations}
                sub="개의 루트 대화"
                loading={convsLoading}
              />
              <StatCard
                label="호외 발행"
                value={stats.totalBranches}
                sub="개의 분기 생성"
                loading={convsLoading}
              />
              <StatCard
                label="누적 단락"
                value={stats.totalTurns}
                sub="번의 대화 턴"
                loading={convsLoading}
              />
            </div>

            <UsageMeter plan={plan} />
          </div>

          <div className="space-y-4">
            <PlanCard plan={plan} />
            <RecentConversations
              conversations={recentConversations}
              isLoading={convsLoading}
              now={now}
            />
          </div>
        </div>

        <DangerZone onRequestDelete={() => setShowDeleteModal(true)} />
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
