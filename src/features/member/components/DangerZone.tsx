import React from 'react';

interface DangerZoneProps {
  onRequestDelete: () => void;
}

const DangerZone: React.FC<DangerZoneProps> = ({ onRequestDelete }) => (
  <div
    style={{
      marginTop: 22,
      padding: '18px 22px',
      border: '1.5px solid var(--red)',
      background:
        'repeating-linear-gradient(-45deg, transparent 0 8px, rgba(160,48,40,0.08) 8px 9px), var(--paper-card)',
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
        구독 해지 (계정 삭제)
      </h4>
      <p
        style={{
          margin: 0,
          fontFamily: 'var(--serif)',
          fontStyle: 'italic',
          fontSize: 13,
          color: 'var(--ink-2)',
        }}
      >
        모든 호와 호외가 보관함에서 영구히 제거됩니다. 이 결정은 되돌릴 수 없습니다.
      </p>
    </div>
    <button type="button" className="nm-btn nm-btn-red" onClick={onRequestDelete}>
      구독 해지 ▸
    </button>
  </div>
);

export default DangerZone;
