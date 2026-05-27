import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import EmailLoginForm from '../features/auth/components/EmailLoginForm';
import EmailSignupForm from '../features/auth/components/EmailSignupForm';
import { PATHS } from '../app/router/routes';

type AuthMode = 'login' | 'signup';

const HERO_FEATURES = [
  { icon: '◎', title: '분기 관리', desc: '대화 흐름을 DAG 구조로 관리' },
  { icon: '◇', title: '그래프 시각화', desc: '분기 구조를 한눈에 파악' },
  { icon: '△', title: '맥락 보존', desc: '분기별 독립적인 컨텍스트 유지' },
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
    <div className="min-h-screen bg-slate-950 flex">
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 border-r border-slate-800/60">
        <div>
          <img
            src="/AI-star-logo.svg"
            alt="AIT"
            className="h-16 w-16 rounded-2xl"
          />
          <p className="text-slate-500 text-sm mt-1">분기 그래프 기반 대화형 AI 에이전트</p>
        </div>

        <div className="space-y-6">
          <p className="text-xl font-light text-slate-200 leading-relaxed max-w-sm">
            "대화의 흐름을 잃지 않고, 원하는 지점에서 언제든 새로운 분기를 시작하세요."
          </p>
          <div className="space-y-3">
            {HERO_FEATURES.map(f => (
              <div key={f.title} className="flex items-start gap-3">
                <span className="text-cyan-300 text-lg leading-5 flex-shrink-0">{f.icon}</span>
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

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-12 text-center">
            <img
              src="/AI-star-logo.svg"
              alt="AIT"
              className="mx-auto h-16 w-16 rounded-2xl"
            />
            <p className="text-slate-500 text-sm mt-2">분기 그래프 기반 대화형 AI 에이전트</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1.5">
              {isLoginMode ? '시작하기' : '계정 만들기'}
            </h2>
            <p className="text-slate-500 text-sm">
              {isLoginMode ? '계정으로 계속하세요' : '이메일로 새 계정을 만드세요'}
            </p>
          </div>

          {isLoginMode ? (
            <EmailLoginForm onSuccess={onSuccess} />
          ) : (
            <EmailSignupForm onSuccess={onSuccess} />
          )}

          <p className="text-center text-slate-500 text-xs mt-6">
            {isLoginMode ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}{' '}
            <button
              type="button"
              onClick={() => setMode(isLoginMode ? 'signup' : 'login')}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition"
            >
              {isLoginMode ? '회원가입' : '로그인'}
            </button>
          </p>

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
