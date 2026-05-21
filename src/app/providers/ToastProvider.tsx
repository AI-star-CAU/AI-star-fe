import React, { useCallback, useEffect, useRef, useState } from 'react';
import Toast, { type ToastItem } from '../../shared/components/feedback/Toast';
import { TOAST_EVENT, type ToastEventDetail } from './toastEvents';

/**
 * `window.dispatchEvent(new CustomEvent('app:toast', { detail: { type, message } }))`
 * 로 어디서든 토스트를 띄울 수 있다.
 *
 * 인터셉터·SSE 핸들러 등 React 트리 밖에서도 호출할 수 있도록 의도적으로
 * Context 가 아닌 window CustomEvent 를 채택했다.
 */
const AUTO_DISMISS_MS = 4500;

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<ToastEventDetail>).detail;
      if (!detail?.message) return;
      const id = nextId.current++;
      setToasts(prev => [
        ...prev,
        { id, type: detail.type ?? 'info', message: detail.message },
      ]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    };
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, [dismiss]);

  return (
    <>
      {children}
      <div
        className="pointer-events-none fixed top-4 right-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2"
        aria-live="polite"
      >
        {toasts.map(toast => (
          <Toast key={toast.id} toast={toast} onClose={dismiss} />
        ))}
      </div>
    </>
  );
};

export default ToastProvider;
