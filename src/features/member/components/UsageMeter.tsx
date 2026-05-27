import React from 'react';
import { useUsage } from '../../usage/hooks/useUsage';

/** Phase 4 §3.3: 실제 /usage/me 응답으로 이번 기간 토큰 사용량을 표시한다. */
const BAR_BY_LEVEL: Record<string, string> = {
  NONE: 'from-cyan-400 to-teal-400',
  WARN: 'from-amber-400 to-orange-400',
  CRITICAL: 'from-red-500 to-rose-500',
};

const UsageMeter: React.FC = () => {
  const { data: usage, isLoading, isError } = useUsage();

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="section-label">이번 기간 토큰 사용량</p>
        {usage && (
          <span className="text-xs text-slate-500">
            {usage.tokenLimit === 0
              ? '무제한'
              : `${usage.tokensUsed.toLocaleString()} / ${usage.tokenLimit.toLocaleString()}`}
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="h-2 bg-slate-800/60 rounded-full animate-pulse" />
      ) : isError || !usage ? (
        <p className="text-sm text-slate-500">사용량 정보를 불러올 수 없습니다.</p>
      ) : usage.tokenLimit === 0 ? (
        <p className="text-sm text-slate-400">
          {usage.planName} 플랜은 토큰 사용량 제한이 없습니다.
        </p>
      ) : (
        <>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${BAR_BY_LEVEL[usage.warningLevel] ?? BAR_BY_LEVEL.NONE} rounded-full transition-all duration-700`}
              style={{ width: `${Math.min(100, Math.round((usage.usageRatio ?? 0) * 100))}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-600 mt-2">
            남은 토큰: {(usage.remainingTokens ?? 0).toLocaleString()}개,{' '}
            {Math.round((usage.usageRatio ?? 0) * 100)}% 사용
            {usage.warningLevel === 'CRITICAL' && (
              <span className="text-red-400"> · 한도 임박</span>
            )}
            {usage.warningLevel === 'WARN' && (
              <span className="text-amber-400"> · 사용량 주의</span>
            )}
          </p>
        </>
      )}
    </div>
  );
};

export default UsageMeter;
