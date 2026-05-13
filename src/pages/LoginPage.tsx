import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import SocialLoginButtons from '../features/auth/components/SocialLoginButtons';
import { PATHS } from '../app/router/routes';

const HERO_FEATURES = [
  { icon: '◎', title: '분기 관리', desc: '대화 흐름을 DAG 구조로 관리' },
  { icon: '◇', title: '그래프 시각화', desc: '분기 구조를 한눈에 파악' },
  { icon: '△', title: '맥락 보존', desc: '분기별 독립적인 컨텍스트 유지' },
];

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      navigate(PATHS.CHAT_NEW, { replace: true });
    }
  }, [user, isLoading, navigate]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <div className="hidden lg:flex flex-1 flex-col justify-between p-16 border-r border-slate-800/60">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight">
            <span className="text-cyan-300">A</span>IT
          </h1>
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
            <h1 className="text-4xl font-black text-white tracking-tight">
              <span className="text-cyan-300">A</span>IT
            </h1>
            <p className="text-slate-500 text-sm mt-2">분기 그래프 기반 대화형 AI 에이전트</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1.5">시작하기</h2>
            <p className="text-slate-500 text-sm">계정으로 계속하세요</p>
          </div>

          <SocialLoginButtons onSuccess={() => navigate(PATHS.CHAT_NEW, { replace: true })} />

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
