import React from 'react';

interface UsageMeterProps {
  plan: 'free' | 'pro';
}

const UsageMeter: React.FC<UsageMeterProps> = ({ plan }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="section-label">이번 달 토큰 사용량</p>
      <span className="text-xs text-slate-500">
        {plan === 'free' ? '12,450 / 50,000' : '무제한'}
      </span>
    </div>
    {plan === 'free' && (
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
    {plan === 'pro' && (
      <p className="text-sm text-slate-400">Pro 플랜은 토큰 사용량 제한이 없습니다.</p>
    )}
  </div>
);

export default UsageMeter;
