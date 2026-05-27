import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  sub?: string;
  loading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, loading }) => (
  <div
    style={{
      padding: '18px 22px',
      borderRight: '1px solid var(--paper-aged)',
      textAlign: 'center',
    }}
    className="stat-cell-item"
  >
    <div
      style={{
        fontFamily: 'var(--body)',
        fontSize: 10,
        color: 'var(--ink-3)',
      }}
    >
      {label}
    </div>
    {loading ? (
      <div
        style={{
          height: 42,
          width: 60,
          margin: '6px auto',
          background: 'var(--paper-aged)',
          opacity: 0.6,
        }}
        className="animate-pulse"
      />
    ) : (
      <div
        style={{
          fontFamily: 'var(--serif-display)',
          fontWeight: 600,
          fontSize: 42,
          lineHeight: 1,
          color: 'var(--ink)',
          margin: '6px 0',
        }}
      >
        {value}
      </div>
    )}
    {sub && (
      <div
        style={{
          fontFamily: 'var(--body)',
          fontSize: 10,
          color: 'var(--ink-3)',
        }}
      >
        {sub}
      </div>
    )}
  </div>
);

export default StatCard;
