import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import EmailLoginForm from '../features/auth/components/EmailLoginForm';
import EmailSignupForm from '../features/auth/components/EmailSignupForm';
import { PATHS } from '../app/router/routes';

type AuthMode = 'login' | 'signup';

const HERO_FEATURES = [
  { title: '① 분기 관리', desc: '대화를 DAG 구조로 보관해 어떤 가지로든 되돌아갈 수 있습니다.' },
  { title: '② 지면 구성도', desc: '호의 전체 구조를 한 장의 그래프로 펼쳐 한눈에 봅니다.' },
  { title: '③ 맥락 보존', desc: '각 분기는 독립된 컨텍스트를 가져 흐름이 섞이지 않습니다.' },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');

  useEffect(() => {
    if (!isLoading && user) {
      navigate(PATHS.CHAT_NEW, { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) return null;

  const onSuccess = () => navigate(PATHS.CHAT_NEW, { replace: true });
  const isLoginMode = mode === 'login';

  return (
    <div className="min-h-screen">
      <header className="nm-masthead">
        <div className="nm-mast-top">
          <span>SUBSCRIPTION DESK</span>
          <span>창간 1주년 기념호</span>
          <span className="nm-mast-badge">DAILY · KR</span>
        </div>
        <h1 className="nm-mast-name">
          <span className="the">The</span>AIT<span className="pulse" />Times
        </h1>
        <div className="nm-mast-tagline">— 분기 그래프 위에 적힌 대화의 일지, 오늘부터 받아보세요 —</div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12">
        <div className="hidden lg:flex flex-col gap-6">
          <span className="nm-kicker">SINCE 2026 · 매일 새 호 발행</span>
          <h2 className="nm-headline lg">
            대화의 흐름을<br />잃지 않는 신문.
          </h2>
          <p className="nm-subhead">
            AIT는 채팅을 한 줄의 흐름이 아니라, <b style={{ color: 'var(--ink)' }}>지면의 호와 분기로 엮인 작은 신문</b>처럼 보관합니다.
            오늘 묻고, 내일 다시 펼쳐보세요.
          </p>

          <div
            style={{
              borderTop: '3px double var(--rule)',
              borderBottom: '3px double var(--rule)',
              padding: '18px 0',
              textAlign: 'center',
              fontFamily: 'var(--serif-display)',
              fontSize: 22,
              fontStyle: 'italic',
              color: 'var(--ink)',
              lineHeight: 1.35,
            }}
          >
            <span style={{ color: 'var(--red)', fontWeight: 900 }}>“</span>
            원하는 지점에서 언제든<br />
            <b style={{ fontStyle: 'normal' }}>새로운 호외</b>를 발행하세요.
            <span style={{ color: 'var(--red)', fontWeight: 900 }}>”</span>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-4 mt-2">
            {HERO_FEATURES.map(f => (
              <div key={f.title}>
                <p
                  style={{
                    fontFamily: 'var(--serif-display)',
                    fontWeight: 700,
                    fontSize: 14,
                    color: 'var(--ink)',
                    marginBottom: 4,
                  }}
                >
                  {f.title}
                </p>
                <p style={{ fontFamily: 'var(--body)', fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.5 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          <p
            style={{
              marginTop: 'auto',
              paddingTop: 24,
              fontFamily: 'var(--type)',
              fontSize: 10,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: 'var(--ink-faint)',
            }}
          >
            © 2026 AIT. All rights reserved.
          </p>
        </div>

        <div className="flex items-center justify-center">
          <div
            className="w-full max-w-sm"
            style={{
              border: '1.5px solid var(--ink)',
              background: 'var(--paper-card)',
              padding: '28px 26px',
              boxShadow: '8px 8px 0 var(--paper-aged)',
            }}
          >
            <div
              className="text-center mb-2"
              style={{
                fontFamily: 'var(--type)',
                fontSize: 11,
                letterSpacing: '0.3em',
                textTransform: 'uppercase',
                color: 'var(--red-deep)',
              }}
            >
              — {isLoginMode ? 'SUBSCRIBE TODAY' : 'NEW READER'} —
            </div>
            <h2 className="nm-headline md text-center mb-5">
              {isLoginMode ? '구독 신청' : '신규 구독'}
            </h2>

            {isLoginMode ? (
              <EmailLoginForm onSuccess={onSuccess} />
            ) : (
              <EmailSignupForm onSuccess={onSuccess} />
            )}

            <div
              className="text-center mt-4"
              style={{
                fontFamily: 'var(--type)',
                fontSize: 11,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ink-3)',
              }}
            >
              {isLoginMode ? '아직 독자가 아니신가요? ' : '이미 독자이신가요? '}
              <button
                type="button"
                onClick={() => setMode(isLoginMode ? 'signup' : 'login')}
                style={{
                  color: 'var(--red-deep)',
                  borderBottom: '1px solid var(--red-deep)',
                  background: 'transparent',
                  fontFamily: 'inherit',
                  fontSize: 'inherit',
                  letterSpacing: 'inherit',
                  textTransform: 'inherit',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {isLoginMode ? '신규 구독' : '구독 신청'}
              </button>
            </div>

            <p
              className="text-center mt-4"
              style={{
                fontFamily: 'var(--serif)',
                fontSize: 11,
                fontStyle: 'italic',
                color: 'var(--ink-faint)',
                lineHeight: 1.5,
              }}
            >
              계속 진행하면 이용약관 및<br />개인정보 처리방침에 동의합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
