import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type Provider = 'google' | 'github' | 'email';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, login } = useAuth();
  const [pending, setPending] = useState<Provider | null>(null);

  const from = (location.state as { from?: Location })?.from?.pathname ?? '/chat';

  // 이미 로그인된 경우 redirect
  useEffect(() => {
    if (!isLoading && user) {
      navigate(from, { replace: true });
    }
  }, [user, isLoading, navigate, from]);

  const handleLogin = async (provider: Provider) => {
    if (pending) return;
    setPending(provider);
    await login(provider);
    navigate(from, { replace: true });
  };

  if (isLoading) return null;

  const providerButtons: { provider: Provider; label: string; icon: React.ReactNode; className: string }[] = [
    {
      provider: 'google',
      label: 'Google로 계속하기',
      className: 'bg-white hover:bg-gray-50 text-gray-800 shadow-lg shadow-black/30',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
      ),
    },
    {
      provider: 'github',
      label: 'GitHub로 계속하기',
      className: 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white',
      icon: (
        <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left: Branding Panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 border-r border-slate-800/60">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            <span className="text-blue-400">A</span>IT
          </h1>
          <p className="text-slate-500 text-sm mt-1">분기 그래프 기반 대화형 AI 에이전트</p>
        </div>

        <div className="space-y-6">
          <p className="text-xl font-light text-slate-200 leading-relaxed max-w-sm">
            "대화의 흐름을 잃지 않고, 원하는 지점에서 언제든 새로운 분기를 시작하세요."
          </p>
          <div className="space-y-3">
            {[
              { icon: '⑂', title: '분기 관리', desc: '대화 흐름을 DAG 구조로 관리' },
              { icon: '◈', title: '그래프 시각화', desc: '분기 구조를 한눈에 파악' },
              { icon: '◎', title: '맥락 보존', desc: '분기별 독립적인 컨텍스트 유지' },
            ].map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="text-blue-400 text-lg leading-5 flex-shrink-0">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-slate-300">{f.title}</p>
                  <p className="text-xs text-slate-600">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-700 text-xs">© 2026 AIT. All rights reserved.</p>
      </div>

      {/* Right: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile-only logo */}
          <div className="lg:hidden mb-12 text-center">
            <h1 className="text-4xl font-black text-white tracking-tight">
              <span className="text-blue-400">A</span>IT
            </h1>
            <p className="text-slate-500 text-sm mt-2">분기 그래프 기반 대화형 AI 에이전트</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1.5">시작하기</h2>
            <p className="text-slate-500 text-sm">계정으로 계속하세요</p>
          </div>

          <div className="space-y-3">
            {providerButtons.map(({ provider, label, icon, className }) => (
              <button
                key={provider}
                onClick={() => handleLogin(provider)}
                disabled={!!pending}
                className={`w-full flex items-center justify-center gap-3 py-3.5 rounded-2xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
              >
                {pending === provider ? (
                  <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
                ) : (
                  icon
                )}
                {label}
              </button>
            ))}

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-slate-950 px-3 text-xs text-slate-600">또는</span>
              </div>
            </div>

            <button
              onClick={() => handleLogin('email')}
              disabled={!!pending}
              className="w-full py-3.5 border border-slate-700 text-slate-300 hover:bg-slate-800/50 rounded-2xl font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {pending === 'email' ? (
                <span className="inline-block w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                '이메일로 계속하기'
              )}
            </button>
          </div>

          <p className="text-center text-slate-700 text-xs mt-6 leading-relaxed">
            계속 진행하면{' '}
            <span className="text-slate-500 underline cursor-pointer hover:text-slate-300 transition">이용약관</span>
            {' '}및{' '}
            <span className="text-slate-500 underline cursor-pointer hover:text-slate-300 transition">개인정보 처리방침</span>
            에 동의합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
