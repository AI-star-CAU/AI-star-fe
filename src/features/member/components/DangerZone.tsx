import React from 'react';

interface DangerZoneProps {
  onRequestDelete: () => void;
}

const DangerZone: React.FC<DangerZoneProps> = ({ onRequestDelete }) => (
  <div
    style={{
      marginTop: 22,
      padding: '18px 22px',
      border: '1px solid rgba(17,19,21,0.24)',
      borderRadius: 12,
      background: 'var(--paper-card)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 18,
    }}
  >
    <div>
      <h4
        style={{
          margin: '0 0 4px',
          fontFamily: 'var(--serif-display)',
          fontWeight: 900,
          color: 'var(--red-deep)',
          fontSize: 18,
        }}
      >
        계정 삭제
      </h4>
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--body)',
          fontSize: 13,
          color: 'var(--ink-2)',
        }}
      >
        모든 대화와 분기가 영구 삭제됩니다. 이 결정은 되돌릴 수 없습니다.
      </p>
    </div>
    <button type="button" className="nm-btn nm-btn-red" onClick={onRequestDelete}>
      계정 삭제
    </button>
  </div>
);

export default DangerZone;
