# AI-star-fe 파일 구조

## 루트

```
AI-star-fe/
├── public/                  # 정적 자산 디렉터리
│   ├── chat-page-design.svg # 채팅 화면 디자인 참고 이미지
│   └── login-page-design.svg # 로그인 화면 디자인 참고 이미지
├── src/                     # 애플리케이션 소스
├── dist/                    # 빌드 산출물 (자동 생성)
├── node_modules/            # npm 의존성 (자동 생성)
├── index.html               # Vite HTML 진입점
├── package.json             # 의존성, npm script 정의
├── package-lock.json        # 의존성 잠금 파일
├── vite.config.ts           # Vite 설정
├── tsconfig.json            # TypeScript 공통 설정
├── tsconfig.app.json        # 브라우저 앱용 TypeScript 설정
├── tsconfig.node.json       # Node/Vite 설정 파일용 TypeScript 설정
├── eslint.config.js         # ESLint 설정
├── README.md                # 프로젝트 기본 안내
├── CLAUDE.md                # LLM 작업 규칙
├── SUMMARY.md               # 변경 사항 요약
├── FE_ARCHITECTURE_REPORT.md # 강의 설계 원리 기반 FE 아키텍처 분석 보고서
└── FILE_STRUCTURE.md        # 파일 구조 문서
```

## `src/` 구조

```
src/
├── main.tsx                 # React 앱 마운트 진입점
├── app/                     # 앱 전역 설정 계층
│   ├── App.tsx              # 라우터를 감싸는 최상위 앱 컴포넌트
│   ├── errors/              # 전역 렌더링 오류 처리
│   │   └── AppErrorBoundary.tsx # 화면 오류 시 fallback UI 표시
│   ├── providers/           # 전역 Provider 조합
│   │   ├── AppProviders.tsx # Router, Query, Auth, Toast, ErrorBoundary 조합
│   │   ├── QueryProvider.tsx # TanStack Query 클라이언트 설정
│   │   ├── ToastProvider.tsx # 전역 토스트 렌더링
│   │   └── toastEvents.ts   # re-export shim → shared/utils/toastEvents.ts
│   └── router/              # 라우팅 설정
│       ├── AppRouter.tsx    # 전체 Route 선언
│       ├── routes.ts        # 경로 상수와 path helper
│       └── guards/          # 접근 제어 라우트
│           ├── ProtectedRoute.tsx # 로그인 필요 라우트 보호
│           └── PublicRoute.tsx # 로그인 사용자 접근 제한 라우트
│
├── pages/                   # 라우트 단위 화면
│   ├── LoginPage.tsx        # 로그인/회원가입 화면
│   ├── MyPage.tsx           # 사용자 정보와 사용 현황 화면
│   ├── SettingsPage.tsx     # 환경 설정 화면
│   └── chat/                # 채팅 라우트 화면 조각
│       ├── ChatLayout.tsx   # 채팅 화면 조립(hook 으로 파생 상태 위임), 사이드바/본문 배치
│       ├── ConversationView.tsx # 기존 대화 메시지 목록과 입력 영역
│       ├── NewChatLanding.tsx # 새 대화 시작 화면
│       └── hooks/           # ChatLayout 파생 상태 hooks (ChatLayout 에서 추출)
│           ├── useChatRouteState.ts # 활성 대화 id / turnId 검색 파라미터
│           ├── useActiveConversation.ts # 목록 + chatMeta fallback
│           ├── useBranchContext.ts # 활성 분기 / 부모 메시지 / 분기 마커 라벨
│           └── useLiveMessageMerge.ts # history + send/regenerate/edit live 병합
│
├── features/                # 기능 단위 모듈
│   ├── auth/                # 인증 기능
│   │   ├── api/             # 인증 관련 HTTP 호출
│   │   │   ├── authApi.ts   # 로그인/회원가입 API
│   │   │   └── memberApi.ts # re-export shim → member/api/memberApi.ts
│   │   ├── components/      # 인증 화면 UI
│   │   │   ├── EmailLoginForm.tsx # 이메일 로그인 폼
│   │   │   └── EmailSignupForm.tsx # 이메일 회원가입 폼
│   │   ├── context/         # 인증 상태 Context
│   │   │   ├── AuthContext.ts # 인증 Context와 reducer 정의
│   │   │   └── AuthProvider.tsx # 로그인/로그아웃/세션 복원 Provider
│   │   ├── hooks/           # 인증 hooks
│   │   │   ├── useAuth.ts   # AuthContext 접근 hook
│   │   │   ├── useLogin.ts  # 로그인 mutation hook
│   │   │   └── useSignup.ts # 회원가입 mutation hook
│   │   ├── utils/           # 인증 유틸
│   │   │   ├── authStorage.ts # 토큰/유저 localStorage 저장소
│   │   │   └── errorMessage.ts # 인증 오류 메시지 변환
│   │   └── types.ts         # 인증/사용자 타입
│   │
│   ├── branch/              # 분기 기능
│   │   ├── api/             # 분기 관련 HTTP 호출
│   │   │   ├── branchApi.ts # 분기 생성/수정/삭제/복구 API
│   │   │   └── schemas.ts   # 분기 API zod 스키마
│   │   ├── hooks/           # 분기 hooks
│   │   │   ├── useBranchMessages.ts # 여러 분기의 메시지 조회
│   │   │   ├── useChatTitle.ts # re-export shim → graph/hooks/useChatTitle.ts
│   │   │   ├── useCreateBranch.ts # 분기 생성 mutation hook (ChatLayout 에서 추출)
│   │   │   ├── useUpdateBranch.ts # 분기 제목 수정 mutation hook (BranchRow 에서 추출)
│   │   │   └── useDeleteBranch.ts # 분기 삭제 mutation hook (BranchRow 에서 추출)
│   │   └── types.ts         # 분기 타입
│   │
│   ├── chat/                # 채팅/메시지 기능
│   │   ├── api/             # 채팅 관련 HTTP/SSE 호출
│   │   │   ├── chatApi.ts   # 채팅 목록/메타/턴/삭제 API
│   │   │   ├── chatMappers.ts # API DTO를 FE 모델로 변환
│   │   │   ├── messageStream.ts # 메시지 송신 SSE 처리
│   │   │   ├── schemas.ts   # 채팅 API zod 스키마
│   │   │   └── streamTypes.ts # SSE 이벤트 타입 통합 (Phase 3 §4.1)
│   │   ├── components/      # 채팅 UI
│   │   │   ├── ChatHeader.tsx # 상단 헤더와 사용자 메뉴
│   │   │   ├── ChatInput.tsx # 메시지 입력창
│   │   │   ├── LlmModelSelect.tsx # LLM 모델 선택 드롭다운
│   │   │   ├── MessageBubble.tsx # 단일 메시지 버블
│   │   │   └── MessageList.tsx # 메시지 목록과 스크롤 처리
│   │   ├── constants/       # 채팅 상수
│   │   │   └── llm.ts       # 지원 LLM provider/model 목록
│   │   ├── hooks/           # 채팅 hooks
│   │   │   ├── useChatMeta.ts # 채팅 메타정보 조회
│   │   │   ├── useDeleteChat.ts # 채팅 삭제 mutation
│   │   │   ├── useEditMessage.ts # 메시지 수정 SSE 처리
│   │   │   ├── useMessages.ts # 턴/메시지 무한 조회
│   │   │   ├── useRegenerate.ts # 응답 재생성 SSE 처리
│   │   │   ├── useSendMessage.ts # 메시지 전송/취소 상태 관리
│   │   │   └── useTurnSummary.ts # 비동기 턴 요약 상태 갱신 hook
│   │   ├── utils/           # 채팅 유틸
│   │   │   ├── messageHelpers.ts # 분기 표시용 메시지 가공 함수
│   │   │   └── compressionNotice.ts # 맥락 압축 적용 시 토스트 안내 (Phase 4 §3.2)
│   │   └── types.ts         # 채팅/메시지 타입
│   │
│   ├── conversation-explorer/ # 대화 탐색기/사이드바 (Phase 4 FG-4)
│   │   ├── api/             # 탐색기 API 호출
│   │   │   ├── explorerApi.ts # GET /chats/explorer(트리)·/{rootChatId}(단일)
│   │   │   └── schemas.ts   # 탐색기 응답 zod 스키마
│   │   ├── components/      # 대화 목록 UI
│   │   │   ├── ConversationList.tsx # 최근 대화/분기 트리 목록
│   │   │   └── ConvSidebar.tsx # 좌측 사이드바와 그래프 영역 조립
│   │   ├── hooks/           # 대화 탐색 hooks
│   │   │   ├── useConversations.ts # 탐색기 트리 → Conversation[] 조회 hook
│   │   │   └── useOptimisticGraphMerge.ts # 그래프 스냅샷 조회/낙관적 병합/확장/복구 (ConvSidebar 에서 추출)
│   │   ├── utils/           # 탐색기 유틸
│   │   │   └── explorerMappers.ts # 탐색기 평탄 노드 → Conversation/Branch 변환
│   │   └── types.ts         # 탐색기 타입(ExplorerNode/Tree/Page)
│   │
│   ├── graph/               # 분기 그래프 기능
│   │   ├── api/             # 그래프 API 호출
│   │   │   ├── graphApi.ts  # 그래프 조회/확장 API
│   │   │   └── schemas.ts   # 그래프 API zod 스키마
│   │   ├── components/      # 그래프 UI
│   │   │   ├── GraphLegend.tsx # 그래프 범례
│   │   │   ├── GraphPanel.tsx # 그래프 시각화 패널(렌더/하이라이트 조립)
│   │   │   ├── graphTypes.ts  # GraphNode/GraphEdge/BuiltGraph 내부 타입 (GraphPanel 에서 추출)
│   │   │   ├── graphConstants.ts # 레이아웃 좌표/색 팔레트 상수 (GraphPanel 에서 추출)
│   │   │   ├── graphBuilders.ts # API/로컬 데이터 → 노드/엣지 빌더 + 색 함수 (GraphPanel 에서 추출)
│   │   │   └── graphLayout.ts # 대화 보기(focused) 레이아웃/요약 카드 helper (GraphPanel 에서 추출)
│   │   ├── hooks/           # 그래프 hooks
│   │   │   ├── useCollapsedBranches.ts # 접힌 분기 계산
│   │   │   ├── useChatTitle.ts # 비동기 제목 상태 갱신 hook (branch에서 이동)
│   │   │   ├── useGraph.ts  # 그래프 조회 hook
│   │   │   └── useGraphExpand.ts # 그래프 확장 hook
│   │   └── types.ts         # 그래프 타입
│   │
│   ├── member/              # 사용자/마이페이지 UI
│   │   ├── api/             # 회원 관련 HTTP 호출
│   │   │   └── memberApi.ts # 내 정보 조회/회원 탈퇴 API (auth/api/memberApi.ts 에서 이동)
│   │   └── components/      # 마이페이지 구성 컴포넌트
│   │       ├── DangerZone.tsx # 계정 삭제 영역
│   │       ├── DeleteAccountModal.tsx # 계정 삭제 확인 모달
│   │       ├── PlanBadge.tsx # 플랜 배지
│   │       ├── PlanCard.tsx # 플랜 정보 카드
│   │       ├── ProfileCard.tsx # 프로필 카드
│   │       ├── RecentConversations.tsx # 최근 대화 목록
│   │       ├── StatCard.tsx # 통계 카드
│   │       └── UsageMeter.tsx # 사용량 표시
│   │
│   ├── search/              # 검색 기능
│   │   ├── components/      # 검색 UI
│   │   │   ├── SearchInput.tsx # 검색 입력창
│   │   │   ├── SearchPanel.tsx # 검색 입력/결과 조립 패널
│   │   │   └── SearchResults.tsx # 검색 결과 목록
│   │   ├── hooks/           # 검색 hooks
│   │   │   └── useConversationSearch.ts # 로드된 대화/분기 목록 검색
│   │   └── types.ts         # 검색 결과 타입
│   │
│   ├── settings/            # 환경 설정 기능
│   │   ├── components/      # 설정 UI
│   │   │   └── SettingsSelect.tsx # 설정 선택 필드
│   │   ├── hooks/           # 설정 hooks
│   │   │   └── useSettings.ts # 설정 읽기/갱신 hook
│   │   ├── utils/           # 설정 유틸
│   │   │   └── settingsStorage.ts # localStorage 설정 저장소
│   │   ├── constants.ts     # 기본 설정과 옵션 목록
│   │   └── types.ts         # 설정 타입
│   │
│   └── usage/               # 토큰 사용량 기능 (Phase 4 FR-5.3)
│       ├── api/             # 사용량 API 호출
│       │   ├── usageApi.ts  # GET /usage/me
│       │   └── schemas.ts   # 사용량 응답 zod 스키마
│       ├── hooks/           # 사용량 hooks
│       │   └── useUsage.ts  # 사용량 조회 hook (['usage'])
│       └── types.ts         # 사용량 타입(UsageInfo/WarningLevel)
│
├── shared/                  # 공용 모듈
│   ├── api/                 # 공용 API 인프라
│   │   ├── ApiError.ts      # 표준 API 오류 클래스
│   │   ├── apiResponse.ts   # BE ApiResponse 래퍼 타입
│   │   ├── schemas.ts       # 공통 zod 스키마(apiEnvelope/pageResponse/Title·Summary status)
│   │   ├── client.ts        # fetch 기반 HTTP 클라이언트
│   │   ├── endpoints.ts     # API endpoint 상수
│   │   ├── errorCodes.ts    # BE 오류 코드와 사용자 메시지 매핑
│   │   ├── parseHttpError.ts # HTTP 오류 응답 파싱
│   │   ├── sse.ts           # 범용 SSE 파서/stream helper (parseSseBlock·parseSseStream·streamSSE)
│   │   └── interceptors/    # API 공통 후처리
│   │       └── authInterceptor.ts # 인증 만료 처리
│   ├── components/          # 공용 UI 컴포넌트
│   │   ├── feedback/        # 피드백 UI
│   │   │   └── Toast.tsx    # 토스트 컴포넌트
│   │   ├── layout/          # 레이아웃 UI
│   │   │   └── ResizeHandle.tsx # 패널 크기 조절 핸들
│   │   └── ui/              # 기본 UI
│   │       └── Button.tsx   # 공용 버튼
│   ├── config/              # 런타임 설정
│   │   └── env.ts           # 환경 변수 파싱
│   ├── constants/           # 공용 상수
│   │   └── storageKeys.ts   # localStorage key 상수
│   ├── hooks/               # 공용 hooks
│   │   └── useResizeDrag.ts # 드래그 리사이즈 hook
│   ├── mocks/               # 개발용 목업 데이터 (정규 위치)
│   │   ├── conversations.ts # 대화 목록 목업
│   │   └── messages.ts      # 메시지 목록 목업
│   └── utils/               # 공용 유틸
│       ├── date.ts          # 날짜/시간 유틸
│       └── toastEvents.ts   # React 트리 밖에서 토스트를 띄우는 이벤트 헬퍼
│
├── mocks/                   # 개발용 목업 데이터 (re-export shim — shared/mocks/ 로 이동됨)
│   ├── conversations.ts     # → shared/mocks/conversations.ts
│   └── messages.ts          # → shared/mocks/messages.ts
│
└── styles/                  # 전역 스타일
    └── index.css            # Tailwind 진입점과 공용 스타일
```

## 레이어

```
app -> pages -> features -> shared
```
