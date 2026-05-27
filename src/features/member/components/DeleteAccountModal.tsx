import React, { useState } from 'react';

interface DeleteAccountModalProps {
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
  error?: string | null;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  onConfirm,
  onCancel,
  isDeleting = false,
  error = null,
}) => {
  const [confirmText, setConfirmText] = useState('');
  const canDelete = confirmText === '구독 해지' && !isDeleting;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(24, 20, 16, 0.55)' }}
    >
      <div
        className="w-full max-w-md"
        style={{
          background: 'var(--paper-card)',
          border: '1.5px solid var(--ink)',
          padding: '28px 26px',
          boxShadow: '10px 10px 0 rgba(40,30,20,0.25)',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--type)',
            fontSize: 11,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'var(--red-deep)',
            textAlign: 'center',
            marginBottom: 6,
          }}
        >
          — FINAL NOTICE —
        </div>
        <h3 className="nm-headline md text-center" style={{ marginBottom: 10 }}>
          구독을 해지하시겠습니까?
        </h3>
        <p
          style={{
            fontFamily: 'var(--serif)',
            fontStyle: 'italic',
            fontSize: 14,
            color: 'var(--ink-2)',
            lineHeight: 1.55,
            marginBottom: 16,
            textAlign: 'center',
          }}
        >
          모든 호와 호외 데이터가 보관함에서 영구 제거됩니다.
          <br />
          계속하려면 아래에{' '}
          <b style={{ color: 'var(--red-deep)', fontStyle: 'normal' }}>구독 해지</b>를 입력하세요.
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={e => setConfirmText(e.target.value)}
          placeholder="구독 해지"
          className="nm-input"
          style={{ marginBottom: 12 }}
        />
        {error && (
          <p
            role="alert"
            style={{
              fontFamily: 'var(--type)',
              fontSize: 11,
              letterSpacing: '0.12em',
              color: 'var(--red-deep)',
              borderLeft: '3px solid var(--red)',
              paddingLeft: 10,
              paddingTop: 6,
              paddingBottom: 6,
              background: 'rgba(160, 48, 40, 0.06)',
              marginBottom: 12,
            }}
          >
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="nm-btn nm-btn-ghost"
            style={{ flex: 1 }}
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={!canDelete}
            className="nm-btn nm-btn-red"
            style={{ flex: 1 }}
          >
            {isDeleting ? '해지 중…' : '구독 해지 ▸'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
