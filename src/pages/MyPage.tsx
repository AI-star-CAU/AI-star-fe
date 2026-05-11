import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConversations } from '../hooks/useConversations';

// ── Plan badge ──────────────────────────────────────────────────

const PlanBadge: React.FC<{ plan: 'free' | 'pro' }> = ({ plan }) =>
  plan === 'pro' ? (
    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded-lg px-2.5 py-1">
      ✦ PRO
    </span>
  ) : (
    <span className="inline-flex items-center text-xs font-bold text-slate-400 bg-slate-700/40 border border-slate-700 rounded-lg px-2.5 py-1">
      FREE
    </span>
  );

// ── Stat card ───────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, loading }) => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-5">
    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">{label}</p>
    {loading ? (
      <div className="h-8 w-16 bg-slate-700 rounded-lg animate-pulse" />
    ) : (
      <p className="text-3xl font-black text-white">{value}</p>
    )}
    {sub && <p className="text-xs text-slate-600 mt-1">{sub}</p>}
  </div>
);

// ── Delete account modal ────────────────────────────────────────

interface DeleteModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ onConfirm, onCancel }) => {
  const [confirmText, setConfirmText] = useState('');

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-8 w-full max-w-md shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-2">계정을 삭제하시겠습니까?</h3>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          모든 대화 기록과 분기 데이터가 삭제됩니다.
          삭제된 계정은 30일간 복구 가능하며, 이후 영구 삭제됩니다.
          계속하려면 아래에 <span className="text-white font-bold">계정삭제</span>를 입력하세요.
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          placeholder="계정삭제"
          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
        />
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-700 text-slate-300 hover:bg-slate-800 rounded-xl text-sm font-semibold transition"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmText !== '계정삭제'}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition"
          >
            계정 삭제
          </button>
        </div>
      </div>
    </div>
  );
};

// ── MyPage ──────────────────────────────────────────────────────

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
      {/* Header */}
      <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-5 sticky top-0 z-40">
        <button
          onClick={() => navigate('/chat')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition text-sm font-semibold"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          대화로 돌아가기
        </button>

        <span className="text-xl font-black tracking-tight">
          <span className="text-blue-400">A</span>IT
        </span>

        <button
          onClick={() => { logout(); navigate('/'); }}
          className="text-sm text-slate-500 hover:text-red-400 transition font-semibold"
        >
          로그아웃
        </button>
      </header>

      <main className="max-w-5xl mx-auto px-5 py-10">
        <h1 className="text-2xl font-black mb-8 text-white">마이페이지</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Left: Profile ──────────────────────────────── */}
          <div className="lg:col-span-1 space-y-4">
            {/* Profile card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
              <div className="px-6 pb-6 text-center -mt-12">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 border-4 border-slate-900 flex items-center justify-center text-3xl font-black text-white shadow-xl">
                  {user?.name?.[0] ?? '?'}
                </div>

                {isEditingName ? (
                  <div className="mt-4 flex gap-2">
                    <input
                      value={editedName}
                      onChange={e => setEditedName(e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                      autoFocus
                    />
                    <button
                      onClick={() => setIsEditingName(false)}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-xs font-bold transition"
                    >
                      저장
                    </button>
                  </div>
                ) : (
                  <div
                    className="mt-4 group cursor-pointer"
                    onClick={() => { setEditedName(user?.name ?? ''); setIsEditingName(true); }}
                  >
                    <h2 className="text-lg font-bold text-white group-hover:text-blue-300 transition">
                      {editedName || user?.name}
                    </h2>
                    <span className="text-[10px] text-slate-600 group-hover:text-slate-400 transition">클릭하여 수정</span>
                  </div>
                )}

                <p className="text-sm text-slate-500 mt-1">{user?.email}</p>
                <div className="mt-3 flex justify-center">
                  <PlanBadge plan={user?.plan ?? 'free'} />
                </div>
              </div>
            </div>

            {/* Plan card */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-4">구독 플랜</p>

              {user?.plan === 'free' ? (
                <>
                  <div className="mb-4">
                    <p className="text-sm text-slate-300 font-semibold">무료 플랜</p>
                    <p className="text-xs text-slate-600 mt-1">월 50개 대화 · 분기 제한 있음</p>
                  </div>
                  <button className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white rounded-xl text-sm font-bold transition shadow-lg shadow-blue-500/20">
                    Pro로 업그레이드
                  </button>
                  <p className="text-[10px] text-slate-600 text-center mt-2">월 ₩9,900 · 언제든 해지 가능</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-bold text-amber-400">Pro 플랜</p>
                      <p className="text-xs text-slate-600 mt-0.5">무제한 대화 · 무제한 분기</p>
                    </div>
                    <span className="text-lg">✦</span>
                  </div>
                  <p className="text-xs text-slate-600">다음 결제일: 2026-12-31</p>
                  <button className="w-full mt-3 py-2 border border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600 rounded-xl text-xs font-semibold transition">
                    플랜 관리
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ── Right: Stats + Recent + Settings ──────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3">사용 현황</p>
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

            {/* Token usage bar */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">이번 달 토큰 사용량</p>
                <span className="text-xs text-slate-500">
                  {user?.plan === 'free' ? '12,450 / 50,000' : '무제한'}
                </span>
              </div>
              {user?.plan === 'free' && (
                <>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                      style={{ width: '24.9%' }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-600 mt-2">
                    남은 토큰: 37,550개 · 25% 사용
                  </p>
                </>
              )}
              {user?.plan === 'pro' && (
                <p className="text-sm text-slate-400">Pro 플랜은 토큰 사용량 제한이 없습니다.</p>
              )}
            </div>

            {/* Recent conversations */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">최근 대화</p>
                <button
                  onClick={() => navigate('/chat')}
                  className="text-xs text-blue-400 hover:text-blue-300 transition font-semibold"
                >
                  모두 보기 →
                </button>
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
                  <button
                    onClick={() => navigate('/chat')}
                    className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition"
                  >
                    첫 대화 시작하기 →
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {recentConversations.map(conv => (
                    <button
                      key={conv.id}
                      onClick={() => navigate('/chat')}
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
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Danger zone */}
            <div className="bg-slate-900 border border-red-500/10 rounded-3xl p-5">
              <p className="text-[11px] font-bold text-red-500/60 uppercase tracking-wider mb-4">위험 구역</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-300">계정 삭제</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    모든 대화 기록과 분기 데이터가 삭제됩니다. 30일 내 복구 가능.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="flex-shrink-0 ml-4 px-4 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/60 rounded-xl text-xs font-semibold transition"
                >
                  계정 삭제
                </button>
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
