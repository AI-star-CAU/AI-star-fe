import React, { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConversations } from '../hooks/useConversations';
import Button from '../components/ui/Button';

const PlanBadge: React.FC<{ plan: 'free' | 'pro' }> = ({ plan }) =>
  plan === 'pro' ? (
    <span className="badge-pro">PRO</span>
  ) : (
    <span className="badge-free">FREE</span>
  );

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, loading }) => (
  <div className="card-inner p-5">
    <p className="section-label mb-2">{label}</p>
    {loading ? (
      <div className="h-8 w-16 bg-slate-700 rounded-lg animate-pulse" />
    ) : (
      <p className="text-3xl font-black text-white">{value}</p>
    )}
    {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
  </div>
);

interface DeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ onConfirm, onCancel }) => {
  const [confirmText, setConfirmText] = useState('');
  const canDelete = confirmText === '계정 삭제';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-2">계정을 삭제하시겠습니까?</h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          모든 대화 기록과 분기 데이터가 삭제됩니다. 계속하려면 아래에
          <span className="text-white font-bold"> 계정 삭제</span>를 입력하세요.
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          placeholder="계정 삭제"
          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
        />
        <div className="flex gap-3">
          <Button onClick={onCancel} variant="ghost" fullWidth>
            취소
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!canDelete}
            variant="danger"
            fullWidth
            className="bg-red-600 text-white hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:border-slate-700"
          >
            계정 삭제
          </Button>
        </div>
      </div>
    </div>
  );
};

const MyPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { data: conversations = [], isLoading: convsLoading } = useConversations();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(user?.name ?? '');

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

  const handleDeleteAccount = () => {
    logout();
    navigate('/');
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}분 전`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}시간 전`;
    return `${Math.floor(hrs / 24)}일 전`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-5 sticky top-0 z-40">
        <Link
          to="/chat"
          className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-semibold"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          대화로 돌아가기
        </Link>

        <Link to="/chat" className="text-xl font-black tracking-tight hover:opacity-80 transition">
          <span className="text-gradient-blue">A</span>IT
        </Link>

        <Button
          onClick={() => { logout(); navigate('/'); }}
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
            <div className="card overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500" />
              <div className="px-6 pb-6 text-center -mt-12">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-500 border-4 border-slate-900 flex items-center justify-center text-3xl font-black text-slate-950 shadow-xl">
                  {user?.name?.[0] ?? '?'}
                </div>

                {isEditingName ? (
                  <div className="mt-4 flex gap-2">
                    <input
                      value={editedName}
                      onChange={e => setEditedName(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 text-center"
                      autoFocus
                    />
                    <Button onClick={() => setIsEditingName(false)} size="sm">
                      저장
                    </Button>
                  </div>
                ) : (
                  <div
                    className="mt-4 group cursor-pointer"
                    onClick={() => { setEditedName(user?.name ?? ''); setIsEditingName(true); }}
                  >
                    <h2 className="text-lg font-bold text-white group-hover:text-cyan-200 transition">
                      {editedName || user?.name}
                    </h2>
                    <span className="text-[10px] text-slate-600 group-hover:text-slate-400 transition">
                      클릭하여 수정
                    </span>
                  </div>
                )}

                <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
                <div className="mt-3 flex justify-center">
                  <PlanBadge plan={user?.plan ?? 'free'} />
                </div>
              </div>
            </div>

            <div className="card p-5">
              <p className="section-label mb-4">구독 플랜</p>

              {user?.plan === 'free' ? (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-slate-300 font-semibold">무료 플랜</p>
                    <p className="text-xs text-slate-600 mt-1">월 50개 대화, 분기 제한 있음</p>
                  </div>
                  <Button
                    fullWidth
                    className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:opacity-90 shadow-lg shadow-cyan-400/20"
                  >
                    Pro로 업그레이드
                  </Button>
                  <p className="text-[10px] text-slate-600 text-center mt-2">월 9,900원, 언제든 해지 가능</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-amber-400">Pro 플랜</p>
                      <p className="text-xs text-slate-600 mt-0.5">무제한 대화, 무제한 분기</p>
                    </div>
                    <span className="text-lg">PRO</span>
                  </div>
                  <p className="text-xs text-slate-600">다음 결제일: 2026-12-31</p>
                  <Button variant="ghost" size="sm" fullWidth className="mt-3">
                    플랜 관리
                  </Button>
                </>
              )}
            </div>
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

            <div className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="section-label">이번 달 토큰 사용량</p>
                <span className="text-xs text-slate-500">
                  {user?.plan === 'free' ? '12,450 / 50,000' : '무제한'}
                </span>
              </div>
              {user?.plan === 'free' && (
                <>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-teal-400 rounded-full transition-all duration-700"
                      style={{ width: '24.9%' }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-600 mt-2">
                    남은 토큰: 37,550개, 25% 사용
                  </p>
                </>
              )}
              {user?.plan === 'pro' && (
                <p className="text-sm text-slate-400">Pro 플랜은 토큰 사용량 제한이 없습니다.</p>
              )}
            </div>

            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="section-label">최근 대화</p>
                <Link
                  to="/chat"
                  className="text-xs text-cyan-300 hover:text-cyan-200 transition font-semibold"
                >
                  모두 보기
                </Link>
              </div>

              {convsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-slate-800 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentConversations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-slate-600 text-sm">대화 기록이 없습니다.</p>
                  <Link
                    to="/chat"
                    className="mt-3 text-xs text-cyan-300 hover:text-cyan-200 transition"
                  >
                    첫 대화 시작하기
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentConversations.map(conv => (
                    <Link
                      key={conv.id}
                      to={`/chat/${conv.id}`}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40 hover:border-slate-600 rounded-xl transition group text-left"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition truncate">
                          {conv.title}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5 truncate">{conv.preview}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                        {conv.branches.length > 0 && (
                          <span className="text-[10px] text-amber-500/80 border border-amber-500/20 rounded-md px-1.5 py-0.5 font-semibold">
                            분기 {conv.branches.length}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-600">{formatDate(conv.createdAt)}</span>
                        <svg className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-400 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-slate-900 border border-red-500/10 rounded-3xl p-5">
              <p className="text-[11px] font-bold text-red-500/60 uppercase tracking-wider mb-4">위험 구역</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-300">계정 삭제</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    모든 대화 기록과 분기 데이터가 삭제됩니다.
                  </p>
                </div>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="danger"
                  size="sm"
                  className="flex-shrink-0 ml-4"
                >
                  계정 삭제
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {showDeleteModal && (
        <DeleteModal
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  );
};

export default MyPage;
