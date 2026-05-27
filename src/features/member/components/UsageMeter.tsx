import React from 'react';

interface UsageMeterProps {
  plan: 'free' | 'pro';
}

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

const UsageMeter: React.FC<UsageMeterProps> = ({ plan }) => (
  <div
    style={{
      border: '1.5px solid var(--ink)',
      padding: '18px 22px',
      background: 'var(--paper-card)',
    }}
  >
    <span className="nm-kicker" style={{ marginBottom: 14 }}>
      오늘의 사용량
    </span>
    {plan === 'free' ? (
      <>
        <Gauge label="토큰 사용" current={12450} max={50000} />
        <Gauge label="호외 슬롯" current={3} max={5} />
      </>
    ) : (
      <p
        style={{
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          color: 'var(--ink-2)',
          fontSize: 14,
          marginTop: 10,
        }}
      >
        Premium 플랜은 사용량 제한이 없습니다.
      </p>
    )}
  </div>
);

export default UsageMeter;
