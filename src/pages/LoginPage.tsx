import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import EmailLoginForm from '../features/auth/components/EmailLoginForm';
import EmailSignupForm from '../features/auth/components/EmailSignupForm';
import { PATHS } from '../app/router/routes';

type AuthMode = 'login' | 'signup';

const HERO_FEATURES = [
  { title: '① 분기 관리', desc: '대화를 DAG 구조로 보관해 원하는 가지로 되돌아갈 수 있습니다.' },
  { title: '② 그래프 보기', desc: '대화와 분기의 연결 구조를 한 장의 그래프로 확인합니다.' },
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
          <span>AIT</span>
          <span>Branching AI Workspace</span>
          <span className="nm-mast-badge">Beta</span>
        </div>
        <h1 className="nm-mast-name">
          AIT
        </h1>
        <div className="nm-mast-tagline">대화를 분기하고 맥락을 이어가는 AI workspace</div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-2 gap-12">
        <div className="hidden lg:flex flex-col gap-6">
          <span className="nm-kicker">Branching chat workspace</span>
          <h2 className="nm-headline lg">
            대화를 원하는 지점에서<br />다시 이어가세요.
          </h2>
          <p className="nm-subhead">
            AIT는 채팅을 하나의 긴 흐름으로만 두지 않고, <b style={{ color: 'var(--ink)' }}>대화와 분기의 구조</b>로 정리합니다.
            필요한 순간 이전 맥락으로 돌아가 새 방향을 시작하세요.
          </p>

          <div
            style={{
              borderTop: '3px double var(--rule)',
              borderBottom: '3px double var(--rule)',
              padding: '18px 0',
              textAlign: 'center',
              fontFamily: 'var(--serif-display)',
              fontSize: 22,
              color: 'var(--ink)',
              lineHeight: 1.35,
            }}
          >
            <span style={{ color: 'var(--red)', fontWeight: 900 }}>“</span>
            원하는 지점에서 언제든<br />
            <b style={{ fontStyle: 'normal' }}>새로운 분기</b>를 시작하세요.
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
              border: '1px solid var(--paper-aged)',
              borderRadius: 14,
              background: 'var(--paper-card)',
              padding: '28px 26px',
              boxShadow: '0 18px 40px rgba(26, 29, 31, 0.08)',
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
              {isLoginMode ? 'LOGIN' : 'SIGN UP'}
            </div>
            <h2 className="nm-headline md text-center mb-5">
              {isLoginMode ? '로그인' : '회원가입'}
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
              {isLoginMode ? '계정이 없으신가요? ' : '이미 계정이 있으신가요? '}
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
                {isLoginMode ? '회원가입' : '로그인'}
              </button>
            </div>

            <p
              className="text-center mt-4"
              style={{
                fontFamily: 'var(--body)',
                fontSize: 11,
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
