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
    <header
      className="h-14 flex items-center justify-between px-5 flex-shrink-0"
      style={{
        background: 'var(--paper-card)',
        borderBottom: '1px solid var(--rule)',
      }}
    >
      <div className="flex items-center gap-3">
        <Button
          onClick={onToggleSidebar}
          variant="iconGhost"
          size="sm"
          className="w-8 h-8 flex-col gap-1.5 flex-shrink-0 px-0 py-0"
          aria-label={sidebarOpen ? '사이드바 닫기' : '사이드바 열기'}
        >
          <span className="w-4.5 h-0.5 rounded-full" style={{ background: 'var(--ink-2)' }} />
          <span className="w-4.5 h-0.5 rounded-full" style={{ background: 'var(--ink-2)' }} />
          <span className="w-4.5 h-0.5 rounded-full" style={{ background: 'var(--ink-2)' }} />
        </Button>

        <Link
          to={PATHS.LOGIN}
          className="inline-flex items-center hover:opacity-80 transition"
          aria-label="AIT"
        >
          <span className="nm-mini-mast">AIT</span>
        </Link>
        <span
          className="hidden sm:block"
          style={{
            fontFamily: 'var(--body)',
            fontSize: 12,
            color: 'var(--ink-3)',
            borderLeft: '1px solid var(--rule-thin)',
            paddingLeft: 12,
          }}
        >
          분기 그래프 · 대화형 AI 에이전트
        </span>
      </div>

      <div className="flex items-center gap-3">
        <UsageWarningChip />
        {plan === 'free' && <span className="nm-stamp bw hidden sm:inline-flex">FREE</span>}
        <div className="relative group">
          <Button variant="avatar" size="avatar">
            {userName?.[0] ?? '?'}
          </Button>
          <div
            className="absolute right-0 top-11 w-52 p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
            style={{
              background: 'var(--paper-card)',
              border: '1px solid var(--paper-aged)',
              borderRadius: 12,
              boxShadow: '0 12px 28px rgba(26, 29, 31, 0.10)',
            }}
          >
            <div
              className="px-3 py-2 mb-1"
              style={{ borderBottom: '1px solid var(--rule-thin)' }}
            >
              <p
                className="text-sm font-bold truncate"
                style={{ color: 'var(--ink)', fontFamily: 'var(--body)' }}
              >
                {userName}
              </p>
              <p
                className="text-xs truncate"
                style={{
                  color: 'var(--ink-3)',
                  fontFamily: 'var(--body)',
                }}
              >
                {userEmail}
              </p>
            </div>
            <Link
              to={PATHS.MY_PAGE}
              className="flex w-full text-left px-3 py-2 transition"
              style={{
                color: 'var(--ink-2)',
                fontFamily: 'var(--body)',
                fontSize: 13,
              }}
            >
              마이페이지
            </Link>
            <Link
              to={PATHS.SETTINGS}
              className="flex w-full text-left px-3 py-2 transition"
              style={{
                color: 'var(--ink-2)',
                fontFamily: 'var(--body)',
                fontSize: 13,
              }}
            >
              설정
            </Link>
            <button
              onClick={() => {
                onLogout();
                navigate(PATHS.LOGIN);
              }}
              className="w-full text-left px-3 py-2"
              style={{
                color: 'var(--red-deep)',
                fontFamily: 'var(--body)',
                fontSize: 13,
                borderTop: '1px solid var(--rule-thin)',
                cursor: 'pointer',
                background: 'transparent',
              }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
