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
    delete: (chatId: number) => `/chats/${chatId}`,
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
  },
  // Phase 4 §2: 대화 탐색기 트리.
  explorer: {
    tree: '/chats/explorer',
    singleTree: (rootChatId: number) => `/chats/explorer/${rootChatId}`,
  },
  // Phase 4 §3.3: 토큰 사용량.
  usage: {
    me: '/usage/me',
  },
} as const;
