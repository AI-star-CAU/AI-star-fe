import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../../shared/components/ui/Button';
import { PATHS } from '../../../app/router/routes';

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

        <Link to={PATHS.LOGIN} className="nm-mini-mast hover:opacity-80 transition">
          AIT
        </Link>
        <span
          className="hidden sm:block"
          style={{
            fontFamily: 'var(--type)',
            fontSize: 11,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            borderLeft: '1px solid var(--rule-thin)',
            paddingLeft: 12,
          }}
        >
          분기 그래프 · 대화형 AI 에이전트
        </span>
      </div>

      <div className="flex items-center gap-3">
        {plan === 'free' && <span className="nm-stamp bw hidden sm:inline-flex">FREE</span>}
        <div className="relative group">
          <Button variant="avatar" size="avatar">
            {userName?.[0] ?? '?'}
          </Button>
          <div
            className="absolute right-0 top-11 w-52 p-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
            style={{
              background: 'var(--paper-card)',
              border: '1.5px solid var(--ink)',
              boxShadow: '4px 4px 0 var(--paper-aged)',
            }}
          >
            <div
              className="px-3 py-2 mb-1"
              style={{ borderBottom: '1px solid var(--rule-thin)' }}
            >
              <p
                className="text-sm font-bold truncate"
                style={{ color: 'var(--ink)', fontFamily: 'var(--serif-display)' }}
              >
                {userName}
              </p>
              <p
                className="text-xs truncate"
                style={{
                  color: 'var(--ink-3)',
                  fontFamily: 'var(--type)',
                  letterSpacing: '0.05em',
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
                fontFamily: 'var(--type)',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              독자 카드
            </Link>
            <Link
              to={PATHS.SETTINGS}
              className="flex w-full text-left px-3 py-2 transition"
              style={{
                color: 'var(--ink-2)',
                fontFamily: 'var(--type)',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              편집국 설정
            </Link>
            <button
              onClick={() => {
                onLogout();
                navigate(PATHS.LOGIN);
              }}
              className="w-full text-left px-3 py-2"
              style={{
                color: 'var(--red-deep)',
                fontFamily: 'var(--type)',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                borderTop: '1px solid var(--rule-thin)',
                cursor: 'pointer',
                background: 'transparent',
              }}
            >
              구독 해지
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
