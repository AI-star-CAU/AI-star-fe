export const ENDPOINTS = {
  auth: {
    login: '/auth/login',
    signup: '/auth/signup',
    logout: '/auth/logout',
    refresh: '/auth/refresh',
    me: '/auth/me',
  },
  chat: {
    list: '/chats',
    detail: (chatId: string) => `/chats/${chatId}`,
    messages: (chatId: string) => `/chats/${chatId}/messages`,
    send: (chatId: string) => `/chats/${chatId}/messages`,
  },
  user: {
    me: '/users/me',
    delete: '/users/me',
  },
} as const;
