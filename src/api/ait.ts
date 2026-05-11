const delay = (ms: number) => new Promise<void>(res => setTimeout(res, ms));

export interface User {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'pro';
}

export interface Branch {
  id: string;
  parentConvId: string;
  title: string;
  forkAtTurnIndex: number;
}

export interface Conversation {
  id: string;
  title: string;
  preview: string;
  createdAt: string;
  turnCount: number;
  branches: Branch[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  isPending?: boolean;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'c1',
    title: '소프트웨어 공학 SRS',
    preview: '기능 요구사항과 비기능 요구사항의 차이...',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    turnCount: 3,
    branches: [
      { id: 'b1', parentConvId: 'c1', title: '유스케이스 분석', forkAtTurnIndex: 1 },
      { id: 'b2', parentConvId: 'c1', title: '비기능 요구사항 심화', forkAtTurnIndex: 2 },
    ],
  },
  {
    id: 'c2',
    title: 'React 최적화 기법',
    preview: 'useMemo와 useCallback의 차이점...',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    turnCount: 5,
    branches: [
      { id: 'b3', parentConvId: 'c2', title: 'Concurrent 모드', forkAtTurnIndex: 3 },
    ],
  },
  {
    id: 'c3',
    title: '알고리즘 복잡도',
    preview: '빅오 표기법의 각 경우에 대해...',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    turnCount: 8,
    branches: [],
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  c1: [
    {
      id: 'm1', conversationId: 'c1', role: 'assistant',
      content: '안녕하세요! AIT입니다. 무엇이든 물어보세요.\n\n대화는 트리 구조로 관리되며, 원하는 지점에서 새로운 분기를 만들 수 있습니다. 왼쪽 그래프에서 현재 대화의 분기 구조를 확인하세요.',
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    },
    {
      id: 'm2', conversationId: 'c1', role: 'user',
      content: 'SRS에서 기능 요구사항과 비기능 요구사항의 차이를 설명해줘.',
      createdAt: new Date(Date.now() - 1000 * 60 * 24).toISOString(),
    },
    {
      id: 'm3', conversationId: 'c1', role: 'assistant',
      content: '**기능 요구사항 (FR)**\n시스템이 *무엇을* 해야 하는지를 정의합니다.\n예: "사용자는 이메일로 로그인할 수 있어야 한다."\n\n**비기능 요구사항 (NFR)**\n시스템이 *어떻게* 동작해야 하는지 품질 기준을 정의합니다.\n예: "로그인 응답은 1초 이내여야 한다."',
      createdAt: new Date(Date.now() - 1000 * 60 * 23).toISOString(),
    },
    {
      id: 'm4', conversationId: 'c1', role: 'user',
      content: 'AIT의 SRS에서 가장 중요한 기능 요구사항은 뭐야?',
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    },
    {
      id: 'm5', conversationId: 'c1', role: 'assistant',
      content: 'AIT SRS 기준으로 핵심 기능 요구사항:\n\n1. **FR-1.1 메시지 송신** — 사용자 입력을 LLM에 전달\n2. **FR-2.1 분기 생성** — 원하는 시점에서 새 대화 흐름 생성\n3. **FR-3.1 그래프 구조 표시** — 분기 구조를 시각화\n4. **FR-5.1 대화 맥락 구분** — 분기별 독립적 컨텍스트 유지',
      createdAt: new Date(Date.now() - 1000 * 60 * 19).toISOString(),
    },
  ],
  c2: [
    {
      id: 'm10', conversationId: 'c2', role: 'assistant',
      content: 'React 최적화에 대해 알아보겠습니다. 어떤 부분이 궁금하신가요?',
      createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
  ],
  c3: [
    {
      id: 'm20', conversationId: 'c3', role: 'assistant',
      content: '알고리즘 복잡도를 함께 분석해봅시다. 어떤 알고리즘이 궁금하신가요?',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
    },
  ],
};

export const api = {
  async getConversations(): Promise<Conversation[]> {
    await delay(600);
    return MOCK_CONVERSATIONS;
  },

  async getMessages(convId: string): Promise<Message[]> {
    await delay(400);
    return MOCK_MESSAGES[convId] ?? [
      {
        id: `default-${convId}`,
        conversationId: convId,
        role: 'assistant',
        content: '새 대화를 시작합니다. 무엇이든 물어보세요!',
        createdAt: new Date().toISOString(),
      },
    ];
  },

  async sendMessage(_convId: string, _content: string): Promise<Message> {
    await delay(1200);
    // TODO: 백엔드 API 연결
    // const res = await fetch('/api/chat', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ conversationId: _convId, content: _content }),
    // });
    // if (!res.ok) throw new Error('API 오류');
    // return res.json();
    return {
      id: `ai-${Date.now()}`,
      conversationId: _convId,
      role: 'assistant',
      content: '백엔드가 아직 연결되지 않았습니다. API 연결 후 실제 응답이 표시됩니다.',
      createdAt: new Date().toISOString(),
    };
  },
};
