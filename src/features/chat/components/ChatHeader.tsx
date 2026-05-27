import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../../shared/components/ui/Button';
import { PATHS } from '../../../app/router/routes';
import { useUsage } from '../../usage/hooks/useUsage';

/** Phase 4 §5.3: 토큰 사용량이 임계(WARN/CRITICAL)에 닿으면 헤더에 경고 칩을 띄운다. */
const UsageWarningChip: React.FC = () => {
  const { data: usage } = useUsage();
  if (!usage || usage.warningLevel === 'NONE' || usage.usageRatio == null) {
    return null;
  }

  const percent = Math.round(usage.usageRatio * 100);
  const isCritical = usage.warningLevel === 'CRITICAL';

  return (
    <Link
      to={PATHS.MY_PAGE}
      title={`이번 기간 토큰 사용량 ${percent}% · 남은 토큰 ${(usage.remainingTokens ?? 0).toLocaleString()}개`}
      className={`hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
        isCritical
          ? 'bg-red-500/15 text-red-300 hover:bg-red-500/25'
          : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isCritical ? 'bg-red-400' : 'bg-amber-400'}`} />
      토큰 {percent}%
    </Link>
  );
};

interface ChatHeaderProps {
  userName: string | undefined;
  userEmail: string | undefined;
  plan: string | undefined;
  onLogout: () => void;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  userName,
  userEmail,
  plan,
  onLogout,
  sidebarOpen,
  onToggleSidebar,
}) => {
  const navigate = useNavigate();

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-5 flex-shrink-0">
      <div className="flex items-center gap-3">
        <Button
          onClick={onToggleSidebar}
          variant="iconGhost"
          size="sm"
          className="w-8 h-8 flex-col gap-1.5 flex-shrink-0 px-0 py-0"
          aria-label={sidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
        >
          <span className="w-4.5 h-0.5 bg-slate-400 rounded-full" />
          <span className="w-4.5 h-0.5 bg-slate-400 rounded-full" />
          <span className="w-4.5 h-0.5 bg-slate-400 rounded-full" />
        </Button>

        <Link
          to={PATHS.LOGIN}
          className="text-xl font-black text-white tracking-tight hover:opacity-80 transition"
        >
          <span className="text-gradient-blue">A</span>IT
        </Link>
        <span className="text-slate-700 text-sm hidden sm:block">
          분기 그래프 기반 대화형 AI 에이전트
        </span>
      </div>

      <div className="flex items-center gap-3">
        <UsageWarningChip />
        {plan === 'free' && (
          <span className="badge-free hidden sm:inline-flex">FREE</span>
        )}
        <div className="relative group">
          <Button variant="avatar" size="avatar">
            {userName?.[0] ?? '?'}
          </Button>
          <div className="absolute right-0 top-11 w-48 bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div className="px-3 py-2 border-b border-slate-700/60 mb-1">
              <p className="text-sm font-semibold text-white truncate">{userName}</p>
              <p className="text-xs text-slate-500 truncate">{userEmail}</p>
            </div>
            <Link
              to={PATHS.MY_PAGE}
              className="flex w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-xl transition"
            >
              마이페이지
            </Link>
            <Link
              to={PATHS.SETTINGS}
              className="flex w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/50 rounded-xl transition"
            >
              환경 설정
            </Link>
            <Button
              onClick={() => { onLogout(); navigate(PATHS.LOGIN); }}
              variant="danger"
              size="sm"
              fullWidth
              className="justify-start border-transparent px-3 py-2"
            >
              로그아웃
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
