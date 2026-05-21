export const PATHS = {
  LOGIN: '/',
  CHAT: '/chat',
  CHAT_NEW: '/chat/new',
  CHAT_DETAIL: '/chat/:convId',
  MY_PAGE: '/mypage',
  SETTINGS: '/settings',
} as const;

export const chatPath = (convId: string) => `/chat/${convId}`;
