import React from 'react';

interface PlanCardProps {
  plan: 'free' | 'pro';
}

const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  if (plan === 'pro') {
    return (
      <div
        style={{
          border: '2px solid var(--ink)',
          padding: '18px 16px',
          background: 'var(--paper-card)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--type)',
            fontSize: 10,
            letterSpacing: '0.3em',
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
          }}
        >
          — 구독 현황 —
        </div>
        <div
          style={{
            fontFamily: 'var(--serif-display)',
            fontWeight: 900,
            fontSize: 22,
            color: 'var(--ink)',
            margin: '6px 0',
            lineHeight: 1.1,
          }}
        >
          <i style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Premium</i> 독자
        </div>
        <div
          style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            color: 'var(--ink-3)',
            fontSize: 12,
            marginBottom: 10,
          }}
        >
          다음 결제일: 2026-12-31
        </div>
        <button type="button" className="nm-btn-ghost nm-btn" style={{ width: '100%' }}>
          플랜 관리
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        border: '2px solid var(--ink)',
        padding: '18px 16px',
        textAlign: 'center',
        background:
          'repeating-linear-gradient(-45deg, transparent, transparent 6px, rgba(40,30,20,0.04) 6px, rgba(40,30,20,0.04) 7px), var(--paper-aged)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--type)',
          fontSize: 10,
          letterSpacing: '0.3em',
          color: 'var(--ink-3)',
          textTransform: 'uppercase',
        }}
      >
        — 구독 안내 —
      </div>
      <div
        style={{
          fontFamily: 'var(--serif-display)',
          fontWeight: 900,
          fontSize: 22,
          color: 'var(--ink)',
          margin: '6px 0',
          lineHeight: 1.1,
        }}
      >
        <i style={{ color: 'var(--red)', fontStyle: 'italic' }}>Premium</i>
        <br />
        으로 업그레이드
      </div>
      <div
        style={{
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          color: 'var(--ink-3)',
          fontSize: 12,
          marginBottom: 10,
        }}
      >
        무제한 발행 · 최신 모델 · 호외 슬롯 확장
      </div>
      <div
        style={{
          fontFamily: 'var(--serif-display)',
          fontSize: 28,
          fontWeight: 900,
          margin: '8px 0',
          color: 'var(--ink)',
        }}
      >
        ₩9,900
        <span
          style={{
            fontSize: 12,
            fontFamily: 'var(--type)',
            letterSpacing: '0.18em',
            color: 'var(--ink-3)',
          }}
        >
          {' '}
          / 월
        </span>
      </div>
      <button type="button" className="nm-btn nm-btn-red" style={{ width: '100%' }}>
        업그레이드 ▸
      </button>
    </div>
  );
};

export default PlanCard;
