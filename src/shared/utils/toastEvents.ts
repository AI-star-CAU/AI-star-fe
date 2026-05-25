import type { ToastType } from '../components/feedback/Toast';

export const TOAST_EVENT = 'app:toast';

export interface ToastEventDetail {
  type?: ToastType;
  message: string;
}

/** React 트리 밖에서도 토스트를 띄우기 위한 CustomEvent 헬퍼. */
export function showToast(type: ToastType, message: string): void {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { type, message } }));
}
