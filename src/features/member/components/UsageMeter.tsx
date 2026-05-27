import React from 'react';
import { useUsage } from '../../usage/hooks/useUsage';

const Gauge: React.FC<{ label: string; current: number; max: number }> = ({
  label,
  current,
  max,
}) => {
  const pct = Math.min(100, Math.round((current / max) * 100));
  return (
    <div style={{ margin: '14px 0' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--type)',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          marginBottom: 4,
        }}
      >
        <span>{label}</span>
        <span>
          <b style={{ color: 'var(--ink)' }}>{current.toLocaleString()}</b> / {max.toLocaleString()}
        </span>
      </div>
      <div
        style={{
          height: 14,
          background: 'var(--paper-aged)',
          border: '1.5px solid var(--ink)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            display: 'block',
            height: '100%',
            width: `${pct}%`,
            background:
              'repeating-linear-gradient(45deg, var(--ink) 0 4px, var(--paper) 4px 8px)',
            transition: 'width 0.7s',
          }}
        />
      </div>
    </div>
  );
};

const usageWarningLabel = (warningLevel: string): string | null => {
  if (warningLevel === 'CRITICAL') return ' · 한도 임박';
  if (warningLevel === 'WARN') return ' · 사용량 주의';
  return null;
};

/** Phase 4 §3.3: 실제 /usage/me 응답으로 이번 기간 토큰 사용량을 표시한다. */
const UsageMeter: React.FC = () => {
  const { data: usage, isLoading, isError } = useUsage();

  return (
  <div
    style={{
      border: '1.5px solid var(--ink)',
      padding: '18px 22px',
      background: 'var(--paper-card)',
    }}
  >
    <span className="nm-kicker" style={{ marginBottom: 14 }}>
      이번 기간 토큰 사용량
    </span>
    {isLoading ? (
      <div
        style={{
          height: 14,
          marginTop: 14,
          background: 'var(--paper-aged)',
          opacity: 0.6,
        }}
        className="animate-pulse"
      />
    ) : isError || !usage ? (
      <p
        style={{
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          color: 'var(--ink-3)',
          fontSize: 14,
          marginTop: 10,
        }}
      >
        사용량 정보를 불러올 수 없습니다.
      </p>
    ) : usage.tokenLimit === 0 ? (
      <p
        style={{
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          color: 'var(--ink-2)',
          fontSize: 14,
          marginTop: 10,
        }}
      >
        {usage.planName} 플랜은 토큰 사용량 제한이 없습니다.
      </p>
    ) : (
      <>
        <Gauge label="토큰 사용" current={usage.tokensUsed} max={usage.tokenLimit} />
        <p
          style={{
            fontFamily: 'var(--type)',
            fontSize: 10,
            color: usage.warningLevel === 'CRITICAL' ? 'var(--red-deep)' : 'var(--ink-3)',
            letterSpacing: '0.16em',
            marginTop: 8,
          }}
        >
          남은 토큰: {(usage.remainingTokens ?? 0).toLocaleString()}개,
          {' '}
          {Math.round((usage.usageRatio ?? 0) * 100)}% 사용
          {usageWarningLabel(usage.warningLevel)}
        </p>
      </>
    )}
  </div>
  );
};

export default UsageMeter;
