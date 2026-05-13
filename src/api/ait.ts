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

// ── Mock Conversations ────────────────────────────────────────
//
// c1: 3 user turns  → nodes n0(시작) n1(T1) n2(T2) n3(T3)
//   b1 forkAtTurnIndex 1  → branches from n1
//   b2 forkAtTurnIndex 2  → branches from n2
//
// c2: 4 user turns  → nodes n0(시작) n1(T1) n2(T2) n3(T3) n4(T4)
//   b3 forkAtTurnIndex 3  → branches from n3
//
// c3: 2 user turns  → nodes n0(시작) n1(T1) n2(T2)  (no branches)

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
    turnCount: 4,
    branches: [
      { id: 'b3', parentConvId: 'c2', title: 'Concurrent 모드', forkAtTurnIndex: 3 },
    ],
  },
  {
    id: 'c3',
    title: '알고리즘 복잡도',
    preview: '빅오 표기법의 각 경우에 대해...',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    turnCount: 2,
    branches: [],
  },
];

// ── Mock Messages ─────────────────────────────────────────────

const t = (offsetMin: number) =>
  new Date(Date.now() - 1000 * 60 * offsetMin).toISOString();

const MOCK_MESSAGES: Record<string, Message[]> = {
  // ── c1: 소프트웨어 공학 SRS (3 user turns) ───────────────
  c1: [
    {
      id: 'm1', conversationId: 'c1', role: 'assistant',
      content: '안녕하세요! AIT입니다. 무엇이든 물어보세요.\n\n대화는 트리 구조로 관리되며, 원하는 시점에서 새로운 분기를 만들 수 있습니다.',
      createdAt: t(29),
    },
    // T1
    {
      id: 'm2', conversationId: 'c1', role: 'user',
      content: 'SRS에서 기능 요구사항과 비기능 요구사항의 차이를 설명해줘.',
      createdAt: t(28),
    },
    {
      id: 'm3', conversationId: 'c1', role: 'assistant',
      content: '**기능 요구사항 (FR)**\n시스템이 *무엇을* 해야 하는지를 정의합니다.\n예: "사용자는 이메일로 로그인할 수 있어야 한다."\n\n**비기능 요구사항 (NFR)**\n시스템이 *어떻게* 동작해야 하는지 품질 기준을 정의합니다.\n예: "로그인 응답은 1초 이내여야 한다."',
      createdAt: t(27),
    },
    // T2
    {
      id: 'm4', conversationId: 'c1', role: 'user',
      content: 'AIT의 SRS에서 가장 중요한 기능 요구사항은 뭐야?',
      createdAt: t(22),
    },
    {
      id: 'm5', conversationId: 'c1', role: 'assistant',
      content: 'AIT SRS 기준으로 핵심 기능 요구사항:\n\n1. **FR-1.1 메시지 송신** — 사용자 입력을 LLM에 전달\n2. **FR-2.1 분기 생성** — 원하는 시점에서 새 대화 흐름 생성\n3. **FR-3.1 그래프 구조 표시** — 분기 구조를 시각화\n4. **FR-5.1 대화 맥락 구분** — 분기별 독립적 컨텍스트 유지',
      createdAt: t(21),
    },
    // T3
    {
      id: 'm6', conversationId: 'c1', role: 'user',
      content: '요구사항 검증 방법에는 어떤 게 있어?',
      createdAt: t(15),
    },
    {
      id: 'm7', conversationId: 'c1', role: 'assistant',
      content: '요구사항 검증 주요 기법:\n\n- **리뷰(Review)** — 이해관계자가 문서를 직접 검토\n- **프로토타이핑** — 빠르게 시제품을 만들어 요구사항 적합성 확인\n- **테스트 케이스 도출** — 요구사항마다 대응하는 테스트를 미리 작성\n- **형식적 검증** — 수학적 모델로 완전성·일관성 증명',
      createdAt: t(14),
    },
  ],

  // ── b1: 유스케이스 분석 (forks from c1 T1, 2 branch-specific turns) ──
  b1: [
    {
      id: 'b1m0', conversationId: 'b1', role: 'assistant',
      content: '유스케이스 분석 브랜치입니다. T1에서 분기했습니다.\n기능/비기능 요구사항을 살펴봤으니, 이번엔 유스케이스 관점에서 접근해봅시다.',
      createdAt: t(26),
    },
    // branch T1
    {
      id: 'b1m1', conversationId: 'b1', role: 'user',
      content: '유스케이스 다이어그램은 어떻게 작성해?',
      createdAt: t(25),
    },
    {
      id: 'b1m2', conversationId: 'b1', role: 'assistant',
      content: '유스케이스 다이어그램 작성 단계:\n\n1. **시스템 경계** 정의 — 사각형으로 시스템 범위를 표시\n2. **액터(Actor)** 식별 — 시스템과 상호작용하는 외부 개체 (사람·시스템)\n3. **유스케이스** 도출 — 각 액터가 시스템에서 달성하려는 목표\n4. **관계 표시** — 연관(association), 포함(include), 확장(extend)\n\nAIT 예시:\n- 액터: 일반 사용자, 관리자\n- 유스케이스: 대화 시작, 분기 생성, 그래프 조회',
      createdAt: t(24),
    },
    // branch T2
    {
      id: 'b1m3', conversationId: 'b1', role: 'user',
      content: '«include»와 «extend» 관계의 차이를 예시로 설명해줘.',
      createdAt: t(18),
    },
    {
      id: 'b1m4', conversationId: 'b1', role: 'assistant',
      content: '**«include»** — 기본 유스케이스가 항상 포함하는 공통 동작\n예: "분기 생성" → «include» → "로그인 확인"\n(분기를 생성하려면 반드시 로그인 상태여야 함)\n\n**«extend»** — 특정 조건에서만 선택적으로 추가되는 동작\n예: "대화 전송" → «extend» → "욕설 경고 표시"\n(욕설이 감지될 때만 경고 유스케이스가 활성화)',
      createdAt: t(17),
    },
  ],

  // ── b2: 비기능 요구사항 심화 (forks from c1 T2, 2 branch-specific turns) ──
  b2: [
    {
      id: 'b2m0', conversationId: 'b2', role: 'assistant',
      content: '비기능 요구사항 심화 브랜치입니다. T2에서 분기했습니다.\n핵심 기능 요구사항을 정리했으니, 이번엔 품질 속성을 깊이 살펴봅시다.',
      createdAt: t(20),
    },
    // branch T1
    {
      id: 'b2m1', conversationId: 'b2', role: 'user',
      content: 'FURPS+ 모델에서 각 요소를 AIT에 적용해서 설명해줘.',
      createdAt: t(19),
    },
    {
      id: 'b2m2', conversationId: 'b2', role: 'assistant',
      content: 'AIT에 FURPS+ 적용:\n\n- **F (Functionality)** — 분기 생성·메시지 전송·그래프 조회 기능\n- **U (Usability)** — 직관적 분기 그래프 UI, 응답 1초 이내\n- **R (Reliability)** — 메시지 유실 없는 99.9% 가용성\n- **P (Performance)** — 동시 접속 1,000명 처리, p95 응답 2초\n- **S (Supportability)** — 모듈화된 컴포넌트, CI/CD 자동화\n- **+ (Design/Impl/Interface/Physical)** — REST API, Docker 배포',
      createdAt: t(18),
    },
    // branch T2
    {
      id: 'b2m3', conversationId: 'b2', role: 'user',
      content: '성능 요구사항을 정량적으로 명세하는 구체적인 방법은?',
      createdAt: t(10),
    },
    {
      id: 'b2m4', conversationId: 'b2', role: 'assistant',
      content: '정량적 성능 명세 방법:\n\n1. **응답 시간** — "95%의 API 요청은 500ms 이내 완료"\n2. **처리량** — "초당 500 트랜잭션(TPS) 처리"\n3. **부하 조건 명시** — "동시 접속자 1,000명 환경에서"\n4. **측정 방법** — "k6 부하 테스트로 검증, p95 기준"\n5. **저하 조건** — "최대 부하 시 응답 시간 3배 이내로 제한"',
      createdAt: t(9),
    },
  ],

  // ── c2: React 최적화 기법 (4 user turns) ─────────────────────
  c2: [
    {
      id: 'c2m0', conversationId: 'c2', role: 'assistant',
      content: 'React 최적화에 대해 알아보겠습니다. 어떤 부분이 궁금하신가요?',
      createdAt: t(110),
    },
    // T1
    {
      id: 'c2m1', conversationId: 'c2', role: 'user',
      content: 'useMemo와 useCallback의 차이점을 설명해줘.',
      createdAt: t(109),
    },
    {
      id: 'c2m2', conversationId: 'c2', role: 'assistant',
      content: '**useMemo** — *값*을 메모이제이션합니다.\n```tsx\nconst sorted = useMemo(() => items.sort(), [items]);\n```\n\n**useCallback** — *함수*를 메모이제이션합니다.\n```tsx\nconst handleClick = useCallback(() => doSomething(id), [id]);\n```\n\n핵심: useMemo는 계산 결과를 캐싱, useCallback은 함수 참조를 안정화합니다.',
      createdAt: t(108),
    },
    // T2
    {
      id: 'c2m3', conversationId: 'c2', role: 'user',
      content: 'React.memo는 언제 사용해야 해?',
      createdAt: t(100),
    },
    {
      id: 'c2m4', conversationId: 'c2', role: 'assistant',
      content: 'React.memo는 **부모가 리렌더링될 때 props가 바뀌지 않았다면 자식 렌더링을 건너뛰게** 합니다.\n\n사용 기준:\n- 컴포넌트가 자주 리렌더링되고\n- props가 자주 바뀌지 않으며\n- 렌더링 비용이 클 때\n\n주의: 객체·배열·함수 props는 매번 새 참조가 생기므로 useCallback/useMemo와 함께 써야 효과 있습니다.',
      createdAt: t(99),
    },
    // T3
    {
      id: 'c2m5', conversationId: 'c2', role: 'user',
      content: '코드 스플리팅이란 무엇이고 어떻게 구현해?',
      createdAt: t(90),
    },
    {
      id: 'c2m6', conversationId: 'c2', role: 'assistant',
      content: '코드 스플리팅은 번들을 여러 청크로 나눠 **필요할 때만 로드**하는 기법입니다.\n\nReact에서는 `React.lazy` + `Suspense`로 구현합니다:\n```tsx\nconst ChatPage = React.lazy(() => import(\'./pages/ChatPage\'));\n\n<Suspense fallback={<Spinner />}>\n  <ChatPage />\n</Suspense>\n```\n\n라우트 단위로 적용하면 초기 번들 크기를 크게 줄일 수 있습니다.',
      createdAt: t(89),
    },
    // T4
    {
      id: 'c2m7', conversationId: 'c2', role: 'user',
      content: 'Lazy loading과 Suspense의 관계는?',
      createdAt: t(80),
    },
    {
      id: 'c2m8', conversationId: 'c2', role: 'assistant',
      content: '`React.lazy`로 동적 import를 감싸면 Promise를 반환하는 컴포넌트가 됩니다. `Suspense`는 그 Promise가 pending 상태일 때 `fallback`을 보여주다가, resolve되면 실제 컴포넌트를 렌더링합니다.\n\n즉, lazy가 "언제 로드할지"를 결정하고, Suspense가 "로드 중 무엇을 보여줄지"를 담당합니다.',
      createdAt: t(79),
    },
  ],

  // ── b3: Concurrent 모드 (forks from c2 T3, 2 branch-specific turns) ──
  b3: [
    {
      id: 'b3m0', conversationId: 'b3', role: 'assistant',
      content: 'Concurrent 모드 브랜치입니다. T3(코드 스플리팅)에서 분기했습니다.\nReact 18의 Concurrent 기능을 집중적으로 살펴봅시다.',
      createdAt: t(88),
    },
    // branch T1
    {
      id: 'b3m1', conversationId: 'b3', role: 'user',
      content: 'React 18의 Concurrent 주요 기능은 무엇이 있어?',
      createdAt: t(87),
    },
    {
      id: 'b3m2', conversationId: 'b3', role: 'assistant',
      content: 'React 18 Concurrent 주요 기능:\n\n- **Automatic Batching** — 이벤트 핸들러 외부(setTimeout 등)에서도 state 업데이트 일괄 처리\n- **useTransition** — 긴급하지 않은 업데이트를 "전환"으로 표시해 UI 블로킹 방지\n- **useDeferredValue** — 값의 업데이트를 지연시켜 우선순위가 높은 렌더링을 먼저 처리\n- **Suspense on Server** — 서버 사이드에서도 Suspense 경계 지원',
      createdAt: t(86),
    },
    // branch T2
    {
      id: 'b3m3', conversationId: 'b3', role: 'user',
      content: 'useTransition과 useDeferredValue는 언제 각각 써야 해?',
      createdAt: t(78),
    },
    {
      id: 'b3m4', conversationId: 'b3', role: 'assistant',
      content: '**useTransition** — 상태 업데이트 자체를 전환으로 표시할 때\n```tsx\nconst [isPending, startTransition] = useTransition();\nstartTransition(() => setQuery(input)); // 느려도 괜찮은 업데이트\n```\n업데이트 *트리거 지점*을 내가 직접 제어할 수 있을 때 사용합니다.\n\n**useDeferredValue** — 외부에서 받은 prop이나 context 값을 지연할 때\n```tsx\nconst deferredQuery = useDeferredValue(query); // prop을 지연\n```\n업데이트 *소스를 제어할 수 없을 때* (외부 라이브러리 등) 사용합니다.',
      createdAt: t(77),
    },
  ],

  // ── c3: 알고리즘 복잡도 (2 user turns, no branches) ──────────
  c3: [
    {
      id: 'c3m0', conversationId: 'c3', role: 'assistant',
      content: '알고리즘 복잡도를 함께 분석해봅시다. 어떤 부분이 궁금하신가요?',
      createdAt: t(1450),
    },
    // T1
    {
      id: 'c3m1', conversationId: 'c3', role: 'user',
      content: 'O(1), O(log n), O(n), O(n²)를 예시와 함께 설명해줘.',
      createdAt: t(1449),
    },
    {
      id: 'c3m2', conversationId: 'c3', role: 'assistant',
      content: '- **O(1)** 상수 시간 — 해시맵 조회 `map[key]`\n- **O(log n)** 로그 시간 — 이진 탐색, 입력이 절반씩 줄어듦\n- **O(n)** 선형 시간 — 배열 순회 `for x in arr`\n- **O(n log n)** — 병합 정렬, 퀵 정렬(평균)\n- **O(n²)** 이차 시간 — 버블 정렬, 이중 for 루프\n\nn = 1,000 기준: O(1)=1, O(log n)≈10, O(n)=1,000, O(n²)=1,000,000',
      createdAt: t(1448),
    },
    // T2
    {
      id: 'c3m3', conversationId: 'c3', role: 'user',
      content: '동적 프로그래밍과 분할 정복의 차이는?',
      createdAt: t(1440),
    },
    {
      id: 'c3m4', conversationId: 'c3', role: 'assistant',
      content: '두 기법 모두 문제를 작은 부분 문제로 나누지만 핵심 차이가 있습니다:\n\n**분할 정복**\n- 부분 문제가 서로 *독립적*\n- 결과를 합쳐서 최종 답 도출\n- 예: 병합 정렬, 퀵 정렬\n\n**동적 프로그래밍**\n- 부분 문제가 *중복*되어 재사용 가능\n- 메모이제이션 또는 타뷸레이션으로 중복 계산 제거\n- 예: 피보나치, 배낭 문제, 최장 공통 부분 수열(LCS)',
      createdAt: t(1439),
    },
  ],
};

// ── Helpers ───────────────────────────────────────────────────

export function findBranchById(id: string): Branch | undefined {
  for (const conv of MOCK_CONVERSATIONS) {
    const branch = conv.branches.find(b => b.id === id);
    if (branch) return branch;
  }
  return undefined;
}

export function isKnownId(id: string): boolean {
  if (id === 'new') return true;
  if (MOCK_CONVERSATIONS.some(c => c.id === id)) return true;
  return !!findBranchById(id);
}

// ── API ───────────────────────────────────────────────────────

export const api = {
  async getConversations(): Promise<Conversation[]> {
    await delay(600);
    return MOCK_CONVERSATIONS;
  },

  async getMessages(convOrBranchId: string): Promise<Message[]> {
    await delay(400);
    if (convOrBranchId === 'new') return [];
    return MOCK_MESSAGES[convOrBranchId] ?? [
      {
        id: `default-${convOrBranchId}`,
        conversationId: convOrBranchId,
        role: 'assistant',
        content: '새 대화를 시작합니다. 무엇이든 물어보세요!',
        createdAt: new Date().toISOString(),
      },
    ];
  },

  async sendMessage(conversationId: string, content: string): Promise<Message> {
    void content;
    await delay(1200);
    return {
      id: `ai-${Date.now()}`,
      conversationId,
      role: 'assistant',
      content: '백엔드가 아직 연결되지 않았습니다. API 연결 후 실제 응답이 표시됩니다.',
      createdAt: new Date().toISOString(),
    };
  },
};
