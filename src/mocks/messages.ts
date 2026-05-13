import type { Message } from '../features/chat/types';

const t = (offsetMin: number) =>
  new Date(Date.now() - 1000 * 60 * offsetMin).toISOString();

export const MOCK_MESSAGES: Record<string, Message[]> = {
  c1: [
    {
      id: 'm1', conversationId: 'c1', role: 'assistant',
      content: '안녕하세요! AIT입니다. 무엇이든 물어보세요.\n\n대화는 트리 구조로 관리되며, 원하는 시점에서 새로운 분기를 만들 수 있습니다.',
      createdAt: t(29),
    },
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

  b1: [
    {
      id: 'b1m0', conversationId: 'b1', role: 'assistant',
      content: '유스케이스 분석 브랜치입니다. T1에서 분기했습니다.\n기능/비기능 요구사항을 살펴봤으니, 이번엔 유스케이스 관점에서 접근해봅시다.',
      createdAt: t(26),
    },
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

  b2: [
    {
      id: 'b2m0', conversationId: 'b2', role: 'assistant',
      content: '비기능 요구사항 심화 브랜치입니다. T2에서 분기했습니다.\n핵심 기능 요구사항을 정리했으니, 이번엔 품질 속성을 깊이 살펴봅시다.',
      createdAt: t(20),
    },
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

  c2: [
    {
      id: 'c2m0', conversationId: 'c2', role: 'assistant',
      content: 'React 최적화에 대해 알아보겠습니다. 어떤 부분이 궁금하신가요?',
      createdAt: t(110),
    },
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

  b3: [
    {
      id: 'b3m0', conversationId: 'b3', role: 'assistant',
      content: 'Concurrent 모드 브랜치입니다. T3(코드 스플리팅)에서 분기했습니다.\nReact 18의 Concurrent 기능을 집중적으로 살펴봅시다.',
      createdAt: t(88),
    },
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

  c6: [
    {
      id: 'c6m0', conversationId: 'c6', role: 'assistant',
      content: '배포 설정을 빠르게 확인해볼게요. 어떤 환경 변수가 필요하신가요?',
      createdAt: t(13),
    },
    {
      id: 'c6m1', conversationId: 'c6', role: 'user',
      content: 'Vite에서 클라이언트 환경 변수는 어떤 이름으로 만들어야 해?',
      createdAt: t(12),
    },
    {
      id: 'c6m2', conversationId: 'c6', role: 'assistant',
      content: 'Vite에서 브라우저로 노출되는 환경 변수는 `VITE_` 접두사가 필요합니다.\n\n예: `VITE_API_BASE_URL=https://api.example.com`\n\n코드에서는 `import.meta.env.VITE_API_BASE_URL`로 읽을 수 있습니다.',
      createdAt: t(11),
    },
  ],

  c4: [
    {
      id: 'c4m0', conversationId: 'c4', role: 'assistant',
      content: '프론트엔드 에러 처리는 사용자 흐름이 끊기지 않게 설계하는 것이 핵심입니다. 어떤 상황부터 보고 싶나요?',
      createdAt: t(370),
    },
    {
      id: 'c4m1', conversationId: 'c4', role: 'user',
      content: 'API 요청이 실패했을 때 화면에서는 어떤 상태를 보여줘야 해?',
      createdAt: t(368),
    },
    {
      id: 'c4m2', conversationId: 'c4', role: 'assistant',
      content: 'API 실패 화면은 보통 세 단계로 나누면 좋습니다.\n\n1. **즉시 피드백** — 로딩이 끝났고 실패했다는 점을 명확히 표시\n2. **회복 행동** — 다시 시도 버튼, 이전 화면 이동, 문의 링크 제공\n3. **원인 단서** — 네트워크 오류인지 권한 오류인지 사용자가 이해할 수 있는 문장 제공\n\n개발자용 에러 메시지는 콘솔이나 로깅 도구에 남기고, UI에는 사용자가 행동할 수 있는 문장을 보여주는 편이 안전합니다.',
      createdAt: t(366),
    },
    {
      id: 'c4m3', conversationId: 'c4', role: 'user',
      content: '데이터가 아예 없을 때 empty state는 어떻게 써야 자연스러워?',
      createdAt: t(354),
    },
    {
      id: 'c4m4', conversationId: 'c4', role: 'assistant',
      content: '빈 상태는 "문제가 없음"과 "다음 행동"을 같이 알려줘야 합니다.\n\n- 첫 사용자의 빈 목록: `아직 대화가 없습니다` + `새 채팅` 버튼\n- 검색 결과 없음: `검색 결과가 없습니다` + 검색어 수정 제안\n- 필터 결과 없음: `조건에 맞는 항목이 없습니다` + 필터 초기화 버튼\n\n빈 상태는 에러가 아니므로 경고색보다 차분한 중립 톤이 어울립니다.',
      createdAt: t(352),
    },
    {
      id: 'c4m5', conversationId: 'c4', role: 'user',
      content: '재시도 버튼을 만들 때 주의할 점은?',
      createdAt: t(340),
    },
    {
      id: 'c4m6', conversationId: 'c4', role: 'assistant',
      content: '재시도 버튼은 중복 요청과 사용자의 불안을 줄이는 방향으로 설계합니다.\n\n- 요청 중에는 버튼을 disabled 처리하거나 스피너를 표시\n- 실패 횟수가 많으면 같은 버튼만 반복하지 말고 도움말을 제공\n- 멱등성이 없는 요청은 "다시 결제", "다시 저장"처럼 동작을 구체적으로 표기\n- 네트워크 복구 후 자동 재시도할지 수동 재시도할지 정책을 분리',
      createdAt: t(338),
    },
    {
      id: 'c4m7', conversationId: 'c4', role: 'user',
      content: '폼 검증 에러는 언제 보여주는 게 좋아?',
      createdAt: t(326),
    },
    {
      id: 'c4m8', conversationId: 'c4', role: 'assistant',
      content: '폼 검증은 타이밍이 중요합니다.\n\n- 필수값 누락: 제출 시점에 표시\n- 형식 오류: 입력이 끝난 blur 시점에 표시\n- 비밀번호 강도: 입력 중 실시간 피드백 가능\n- 서버 검증 오류: 제출 후 필드 근처와 상단 요약에 함께 표시\n\n처음부터 빨간 메시지를 많이 보여주면 사용자가 혼나고 있다는 느낌을 받을 수 있으니, 입력 흐름을 방해하지 않는 선에서 점진적으로 보여주세요.',
      createdAt: t(324),
    },
    {
      id: 'c4m9', conversationId: 'c4', role: 'user',
      content: '이런 상태들을 테스트 케이스로 만들면 어떤 목록이 필요해?',
      createdAt: t(310),
    },
    {
      id: 'c4m10', conversationId: 'c4', role: 'assistant',
      content: '추천 테스트 케이스입니다.\n\n1. 로딩 중 스켈레톤 또는 스피너가 표시된다.\n2. API 성공 시 데이터 목록이 렌더링된다.\n3. API 실패 시 에러 메시지와 재시도 버튼이 표시된다.\n4. 재시도 버튼 클릭 시 요청 함수가 다시 호출된다.\n5. 빈 배열 응답 시 empty state가 표시된다.\n6. 폼 제출 시 필수값 오류가 필드 근처에 표시된다.\n7. 서버 검증 오류가 상단 요약과 필드 메시지에 반영된다.\n8. 키보드만으로 에러 영역과 재시도 버튼에 접근할 수 있다.',
      createdAt: t(308),
    },
  ],

  b4: [
    {
      id: 'b4m0', conversationId: 'b4', role: 'assistant',
      content: 'API 실패 UX 브랜치입니다. 첫 번째 질문에서 분기해 실패 상태의 문구와 행동을 더 자세히 봅니다.',
      createdAt: t(364),
    },
    {
      id: 'b4m1', conversationId: 'b4', role: 'user',
      content: '404, 401, 500 에러는 사용자에게 각각 어떻게 말해야 해?',
      createdAt: t(362),
    },
    {
      id: 'b4m2', conversationId: 'b4', role: 'assistant',
      content: '- **404**: "요청한 내용을 찾을 수 없습니다." + 목록으로 돌아가기\n- **401**: "로그인이 만료되었습니다." + 다시 로그인하기\n- **500**: "일시적인 문제가 발생했습니다." + 다시 시도하기\n\n핵심은 HTTP 코드를 그대로 보여주기보다 사용자가 다음에 할 수 있는 행동을 같이 제시하는 것입니다.',
      createdAt: t(360),
    },
  ],

  b5: [
    {
      id: 'b5m0', conversationId: 'b5', role: 'assistant',
      content: '폼 검증 케이스 브랜치입니다. 제출 전/후 검증 흐름을 테스트 데이터처럼 쪼개서 보겠습니다.',
      createdAt: t(322),
    },
    {
      id: 'b5m1', conversationId: 'b5', role: 'user',
      content: '회원가입 폼 기준으로 필수 테스트 케이스를 만들어줘.',
      createdAt: t(320),
    },
    {
      id: 'b5m2', conversationId: 'b5', role: 'assistant',
      content: '회원가입 폼 테스트 케이스:\n\n- 이름 미입력 시 `이름을 입력해주세요` 표시\n- 이메일 형식이 아니면 `올바른 이메일을 입력해주세요` 표시\n- 이미 가입된 이메일이면 서버 오류 메시지 표시\n- 비밀번호가 8자 미만이면 제출 불가\n- 약관 미동의 시 체크박스 근처에 오류 표시\n- 모든 값이 유효하면 가입 요청이 1회만 전송',
      createdAt: t(318),
    },
    {
      id: 'b5m3', conversationId: 'b5', role: 'user',
      content: '에러 메시지 위치는 어디가 좋아?',
      createdAt: t(314),
    },
    {
      id: 'b5m4', conversationId: 'b5', role: 'assistant',
      content: '필드 단위 오류는 해당 입력 바로 아래에 두는 것이 가장 이해하기 쉽습니다. 제출 후 여러 오류가 동시에 생기면 폼 상단에 요약을 추가하고, 각 항목을 해당 필드로 이동할 수 있게 연결하면 접근성도 좋아집니다.',
      createdAt: t(312),
    },
    {
      id: 'b5m5', conversationId: 'b5', role: 'user',
      content: '서버 오류와 클라이언트 오류를 한 화면에서 구분하려면?',
      createdAt: t(306),
    },
    {
      id: 'b5m6', conversationId: 'b5', role: 'assistant',
      content: '클라이언트 오류는 사용자가 입력을 고치면 바로 해결되는 문제로, 필드 근처에 표시합니다. 서버 오류는 인증 만료, 중복 이메일, 내부 오류처럼 요청 결과로 알 수 있는 문제이므로 상단 알림이나 토스트와 함께 관련 필드에도 반영하는 구성이 좋습니다.',
      createdAt: t(304),
    },
  ],

  b6: [
    {
      id: 'b6m0', conversationId: 'b6', role: 'assistant',
      content: '접근성 점검 브랜치입니다. 아직 추가 질문이 없는 분기라 그래프에는 분기 시작점만 표시됩니다.',
      createdAt: t(302),
    },
  ],

  c3: [
    {
      id: 'c3m0', conversationId: 'c3', role: 'assistant',
      content: '알고리즘 복잡도를 함께 분석해봅시다. 어떤 부분이 궁금하신가요?',
      createdAt: t(1450),
    },
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

  c5: [
    {
      id: 'c5m0', conversationId: 'c5', role: 'assistant',
      content: '데이터베이스 인덱스는 조회 성능과 쓰기 비용 사이의 균형을 잡는 작업입니다. 어떤 쿼리를 기준으로 볼까요?',
      createdAt: t(4330),
    },
    {
      id: 'c5m1', conversationId: 'c5', role: 'user',
      content: '인덱스는 많을수록 좋은 거 아니야?',
      createdAt: t(4328),
    },
    {
      id: 'c5m2', conversationId: 'c5', role: 'assistant',
      content: '인덱스가 많으면 읽기는 빨라질 수 있지만 쓰기 비용과 저장 공간이 늘어납니다.\n\n- INSERT/UPDATE/DELETE 때 인덱스도 함께 갱신해야 함\n- 사용하지 않는 인덱스는 쿼리 최적화 비용만 늘릴 수 있음\n- 비슷한 인덱스가 중복되면 운영 관리가 어려워짐\n\n그래서 실제 쿼리 패턴과 실행 계획을 보고 필요한 인덱스만 유지하는 편이 좋습니다.',
      createdAt: t(4326),
    },
    {
      id: 'c5m3', conversationId: 'c5', role: 'user',
      content: '복합 인덱스는 컬럼 순서가 왜 중요해?',
      createdAt: t(4318),
    },
    {
      id: 'c5m4', conversationId: 'c5', role: 'assistant',
      content: '복합 인덱스는 왼쪽부터 순서대로 사용됩니다.\n\n예를 들어 `(team_id, created_at)` 인덱스가 있으면:\n\n- `WHERE team_id = ?`에는 유용\n- `WHERE team_id = ? ORDER BY created_at`에도 유용\n- `WHERE created_at > ?`만 있으면 인덱스를 충분히 활용하기 어렵습니다.\n\n동등 조건이 자주 걸리는 컬럼을 앞에 두고, 정렬이나 범위 조건 컬럼은 뒤에 두는 경우가 많습니다.',
      createdAt: t(4316),
    },
    {
      id: 'c5m5', conversationId: 'c5', role: 'user',
      content: '채팅 앱 메시지 테이블에는 어떤 인덱스가 필요할까?',
      createdAt: t(4306),
    },
    {
      id: 'c5m6', conversationId: 'c5', role: 'assistant',
      content: '채팅 메시지 조회가 "대화방별 최신순 페이지네이션"이라면 보통 아래 인덱스를 먼저 고려합니다.\n\n```sql\nCREATE INDEX idx_messages_conversation_created\nON messages (conversation_id, created_at DESC);\n```\n\n이 인덱스는 특정 대화의 메시지를 시간순으로 가져오는 쿼리에 잘 맞습니다. 분기형 대화라면 `branch_id` 또는 `parent_message_id`를 포함한 조회 패턴도 따로 확인해야 합니다.',
      createdAt: t(4304),
    },
  ],

  b7: [
    {
      id: 'b7m0', conversationId: 'b7', role: 'assistant',
      content: '쿼리 플랜 해석 브랜치입니다. 복합 인덱스 질문에서 분기해 실행 계획을 읽는 방법을 살펴봅니다.',
      createdAt: t(4314),
    },
    {
      id: 'b7m1', conversationId: 'b7', role: 'user',
      content: 'EXPLAIN에서 어떤 항목을 먼저 봐야 해?',
      createdAt: t(4312),
    },
    {
      id: 'b7m2', conversationId: 'b7', role: 'assistant',
      content: '처음에는 아래 항목을 먼저 봅니다.\n\n- 어떤 테이블을 먼저 읽는지\n- 인덱스를 사용하는지, 전체 스캔인지\n- 예상 rows가 너무 크지 않은지\n- 정렬이나 임시 테이블이 추가로 필요한지\n\n실제 운영에서는 `EXPLAIN ANALYZE`로 예상치와 실제 수행 시간이 크게 다른지도 확인합니다.',
      createdAt: t(4310),
    },
    {
      id: 'b7m3', conversationId: 'b7', role: 'user',
      content: '전체 스캔이 항상 나쁜 건가?',
      createdAt: t(4300),
    },
    {
      id: 'b7m4', conversationId: 'b7', role: 'assistant',
      content: '항상 나쁘지는 않습니다. 테이블이 작거나 대부분의 행을 읽어야 하는 쿼리라면 전체 스캔이 더 단순하고 빠를 수 있습니다. 문제는 큰 테이블에서 소수의 행만 필요한데도 전체 스캔을 하는 경우입니다. 이때는 조건 컬럼, 선택도, 정렬 조건에 맞는 인덱스를 검토합니다.',
      createdAt: t(4298),
    },
  ],

  c7: [
    {
      id: 'c7m0', conversationId: 'c7', role: 'assistant',
      content: '긴 답변 렌더링을 확인할 수 있는 대화입니다. 목록, 코드블록, 긴 문단이 섞인 응답을 준비해볼게요.',
      createdAt: t(11550),
    },
    {
      id: 'c7m1', conversationId: 'c7', role: 'user',
      content: '프론트엔드 PR 리뷰 체크리스트를 길게 만들어줘.',
      createdAt: t(11548),
    },
    {
      id: 'c7m2', conversationId: 'c7', role: 'assistant',
      content: '프론트엔드 PR 리뷰 체크리스트입니다.\n\n**동작**\n- 주요 사용자 플로우가 깨지지 않는가\n- 로딩, 실패, 빈 상태가 모두 처리되는가\n- 낙관적 업데이트가 실패했을 때 롤백되는가\n- 브라우저 새로고침 후에도 필요한 상태가 복원되는가\n\n**UI**\n- 모바일과 데스크톱에서 텍스트가 넘치지 않는가\n- 버튼, 입력, 모달의 포커스 상태가 보이는가\n- 비활성 상태와 로딩 상태가 명확한가\n- 긴 제목, 긴 이메일, 긴 메시지처럼 극단적인 데이터도 깨지지 않는가\n\n**코드**\n```tsx\nconst canSubmit = input.trim().length > 0 && !isSending;\n\n<Button disabled={!canSubmit} onClick={handleSubmit}>\n  전송\n</Button>\n```\n\n**접근성**\n- 아이콘 버튼에 `aria-label`이 있는가\n- 에러 메시지가 입력 필드와 연결되어 있는가\n- 키보드만으로 주요 기능을 사용할 수 있는가\n\n마지막으로, 리뷰는 단순히 문제를 찾는 절차가 아니라 같은 제품 감각을 맞추는 과정입니다. 코드가 어떤 사용자를 위해 어떤 실패 상황까지 책임지는지 확인하면 리뷰 품질이 훨씬 좋아집니다.',
      createdAt: t(11546),
    },
    {
      id: 'c7m3', conversationId: 'c7', role: 'user',
      content: '이 체크리스트를 더 짧은 릴리즈 전 점검 목록으로 바꿔줘.',
      createdAt: t(11530),
    },
    {
      id: 'c7m4', conversationId: 'c7', role: 'assistant',
      content: '릴리즈 전 점검 목록:\n\n1. 핵심 플로우 3개 이상 수동 확인\n2. 로딩/에러/빈 상태 확인\n3. 모바일 너비에서 주요 화면 확인\n4. 콘솔 에러와 네트워크 실패 확인\n5. 접근성 기본 항목 확인\n6. 배포 환경 변수와 API URL 확인\n7. 롤백 방법 공유',
      createdAt: t(11528),
    },
  ],

  b8: [
    {
      id: 'b8m0', conversationId: 'b8', role: 'assistant',
      content: '표 형식 요약 브랜치입니다. 긴 체크리스트를 더 스캔하기 쉬운 형태로 바꿔보겠습니다.',
      createdAt: t(11544),
    },
    {
      id: 'b8m1', conversationId: 'b8', role: 'user',
      content: '체크리스트를 영역별 표처럼 요약해줘.',
      createdAt: t(11542),
    },
    {
      id: 'b8m2', conversationId: 'b8', role: 'assistant',
      content: '| 영역 | 확인할 것 |\n| --- | --- |\n| 동작 | 핵심 플로우, 실패 복구, 새로고침 복원 |\n| UI | 반응형, 긴 텍스트, 로딩/비활성 상태 |\n| 코드 | 중복 제거, 명확한 상태 이름, 불필요한 리렌더링 |\n| 접근성 | 포커스, 키보드 이동, aria-label |\n| 배포 | 환경 변수, API URL, 롤백 절차 |',
      createdAt: t(11540),
    },
  ],
};

export function findBranchInMocks(id: string): boolean {
  return Object.keys(MOCK_MESSAGES).includes(id);
}
