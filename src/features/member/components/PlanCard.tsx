import React from 'react';

interface PlanCardProps {
  plan: 'free' | 'pro';
}

const PlanCard: React.FC<PlanCardProps> = ({ plan }) => {
  if (plan === 'pro') {
    return (
      <div
        style={{
          border: '1px solid var(--paper-aged)',
          borderRadius: 12,
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
          플랜 현황
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
          <span style={{ color: 'var(--gold)' }}>Premium</span> 사용자
        </div>
        <div
          style={{
            fontFamily: 'var(--serif)',
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
        border: '1px solid var(--paper-aged)',
        borderRadius: 12,
        padding: '18px 16px',
        textAlign: 'center',
        background: 'var(--paper-card)',
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
        플랜 안내
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
        <span style={{ color: 'var(--red)' }}>Premium</span>
        <br />
        으로 업그레이드
      </div>
      <div
        style={{
          fontFamily: 'var(--serif)',
          color: 'var(--ink-3)',
          fontSize: 12,
          marginBottom: 10,
        }}
      >
        무제한 대화 · 최신 모델 · 분기 슬롯 확장
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
        업그레이드
      </button>
    </div>
  );
};

export default PlanCard;
