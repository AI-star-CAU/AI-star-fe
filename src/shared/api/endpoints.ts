export const ENDPOINTS = {
  auth: {
    signup: '/auth/signup',
    login: '/auth/login',
  },
  member: {
    me: '/members/me',
  },
  chat: {
    list: '/chats',
    create: '/chats',
    detail: (chatId: number) => `/chats/${chatId}`,
    turns: (chatId: number) => `/chats/${chatId}/turns`,
    messages: (chatId: number) => `/chats/${chatId}/messages`,
    cancelMessage: (chatId: number, messageId: number) =>
      `/chats/${chatId}/messages/${messageId}/cancel`,
  },
} as const;
