import React from 'react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toast: ToastItem;
  onClose: (id: number) => void;
}

const TYPE_CLASS: Record<ToastType, string> = {
  success: 'border-emerald-500/30 bg-emerald-950/95 text-emerald-100',
  error: 'border-red-500/30 bg-red-950/95 text-red-100',
  info: 'border-ui-line-strong/40 bg-ui-surface-muted/95 text-ui-text',
};

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => (
  <div
    role="status"
    className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-xl shadow-black/40 backdrop-blur ${TYPE_CLASS[toast.type]}`}
  >
    <span className="text-sm leading-relaxed">{toast.message}</span>
    <button
      type="button"
      onClick={() => onClose(toast.id)}
      className="ml-auto -mr-1 -mt-1 rounded p-1 text-current/70 hover:text-current"
      aria-label="알림 닫기"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
);

export default Toast;
