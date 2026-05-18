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
    regenerate: (chatId: number, messageId: number) =>
      `/chats/${chatId}/messages/${messageId}/regenerate`,
    editMessage: (chatId: number, messageId: number) =>
      `/chats/${chatId}/messages/${messageId}`,
  },
  branch: {
    create: (chatId: number) => `/chats/${chatId}/branches`,
    update: (chatId: number) => `/chats/${chatId}`,
    delete: (chatId: number) => `/chats/${chatId}`,
    graph: (chatId: number) => `/chats/${chatId}/graph`,
    graphExpand: (chatId: number) => `/chats/${chatId}/graph/expand`,
    restore: (chatId: number) => `/chats/${chatId}/restore`,
  },
} as const;
