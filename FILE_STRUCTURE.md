# AI-star-fe 파일 구조

React 19 + TypeScript + Vite 기반 프론트엔드 프로젝트. Feature-Sliced 구조를 따른다.

## 루트

```
AI-star-fe/
├── public/                  # 정적 자산 (디자인 SVG 등)
├── src/                     # 애플리케이션 소스
├── dist/                    # 빌드 산출물 (자동 생성)
├── node_modules/            # 의존성 (자동 생성)
├── index.html               # Vite 진입 HTML
├── package.json             # 의존성/스크립트 (dev, build, lint, preview)
├── vite.config.ts           # Vite 설정
├── tsconfig.json            # TS 루트 설정
├── tsconfig.app.json        # 앱용 TS 설정
├── tsconfig.node.json       # Node 환경 TS 설정
├── eslint.config.js         # ESLint 설정
├── CLAUDE.md                # LLM 작업 가이드
├── README.md
└── FILE_STRUCTURE.md        # (이 문서)
```

## `src/` 구조

```
src/
├── main.tsx                 # React 진입점
│
├── app/                     # 앱 셸 (전역 설정 계층)
│   ├── App.tsx
│   ├── errors/
│   │   └── AppErrorBoundary.tsx
│   ├── providers/
│   │   ├── AppProviders.tsx       # 모든 Provider 조합
│   │   ├── QueryProvider.tsx      # React Query 설정
│   │   ├── ToastProvider.tsx      # 전역 토스트
│   │   └── toastEvents.ts         # React 트리 밖 토스트 이벤트 헬퍼
│   └── router/
│       ├── AppRouter.tsx
│       ├── routes.ts
│       └── guards/
│           ├── ProtectedRoute.tsx # 인증 필요 라우트
│           └── PublicRoute.tsx    # 비인증 전용 라우트
│
├── pages/                   # 라우트 단위 페이지
│   ├── LoginPage.tsx
│   ├── MyPage.tsx
│   ├── SettingsPage.tsx
│   └── chat/
│       ├── ChatLayout.tsx
│       ├── ConversationView.tsx
│       └── NewChatLanding.tsx
│
├── features/                # 도메인별 기능 모듈
│   ├── auth/                # 인증 (로그인/회원가입)
│   │   ├── api/
│   │   │   ├── authApi.ts
│   │   │   └── memberApi.ts
│   │   ├── components/
│   │   │   ├── EmailLoginForm.tsx
│   │   │   └── EmailSignupForm.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.ts
│   │   │   └── AuthProvider.tsx
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useLogin.ts
│   │   │   └── useSignup.ts
│   │   ├── utils/
│   │   │   ├── authStorage.ts
│   │   │   └── errorMessage.ts
│   │   └── types.ts
│   │
│   ├── chat/                # 채팅 (대화/메시지/LLM)
│   │   ├── api/
│   │   │   ├── chatApi.ts
│   │   │   ├── chatMappers.ts
│   │   │   ├── messageStream.ts     # SSE 스트리밍
│   │   │   └── schemas.ts           # zod 스키마
│   │   ├── components/
│   │   │   ├── ChatHeader.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ConversationList.tsx
│   │   │   ├── ConvSidebar.tsx
│   │   │   ├── LlmModelSelect.tsx
│   │   │   ├── MessageBubble.tsx
│   │   │   └── MessageList.tsx
│   │   ├── constants/
│   │   │   └── llm.ts
│   │   ├── hooks/
│   │   │   ├── useChatMeta.ts
│   │   │   ├── useDeleteChat.ts
│   │   │   ├── useEditMessage.ts
│   │   │   ├── useMessages.ts
│   │   │   ├── useRegenerate.ts
│   │   │   ├── useTurnSummary.ts
│   │   │   └── useSendMessage.ts
│   │   ├── utils/
│   │   │   └── messageHelpers.ts
│   │   └── types.ts
│   │
│   ├── branch/              # 분기 CRUD/타입
│   │   ├── api/
│   │   │   ├── branchApi.ts
│   │   │   └── schemas.ts
│   │   ├── hooks/
│   │   │   ├── useBranchMessages.ts
│   │   │   └── useChatTitle.ts
│   │   └── types.ts
│   │
│   ├── conversation-explorer/ # 대화 탐색기/사이드바
│   │   ├── components/
│   │   │   ├── ConvSidebar.tsx
│   │   │   └── ConversationList.tsx
│   │   └── hooks/
│   │       └── useConversations.ts
│   │
│   ├── graph/               # 그래프 시각화
│   │   ├── api/
│   │   │   ├── graphApi.ts
│   │   │   └── schemas.ts
│   │   ├── components/
│   │   │   ├── GraphLegend.tsx
│   │   │   └── GraphPanel.tsx
│   │   ├── hooks/
│   │   │   ├── useCollapsedBranches.ts
│   │   │   ├── useGraph.ts
│   │   │   └── useGraphExpand.ts
│   │   └── types.ts
│   │
│   ├── member/              # 사용자 프로필/마이페이지
│   │   └── components/
│   │       ├── DangerZone.tsx
│   │       ├── DeleteAccountModal.tsx
│   │       ├── PlanBadge.tsx
│   │       ├── PlanCard.tsx
│   │       ├── ProfileCard.tsx
│   │       ├── RecentConversations.tsx
│   │       ├── StatCard.tsx
│   │       └── UsageMeter.tsx
│   │
│   ├── search/              # FG-6 검색
│   │   ├── components/
│   │   │   ├── SearchInput.tsx
│   │   │   ├── SearchPanel.tsx
│   │   │   └── SearchResults.tsx
│   │   ├── hooks/
│   │   │   └── useConversationSearch.ts
│   │   └── types.ts
│   │
│   └── settings/            # FG-10 환경 설정
│       ├── components/
│       │   └── SettingsSelect.tsx
│       ├── hooks/
│       │   └── useSettings.ts
│       ├── utils/
│       │   └── settingsStorage.ts
│       ├── constants.ts
│       └── types.ts
│
├── shared/                  # 공용 모듈 (도메인 무관)
│   ├── api/
│   │   ├── ApiError.ts
│   │   ├── apiResponse.ts
│   │   ├── client.ts              # HTTP 클라이언트
│   │   ├── endpoints.ts           # 엔드포인트 상수
│   │   ├── errorCodes.ts
│   │   ├── parseHttpError.ts
│   │   ├── sse.ts                 # SSE 헬퍼
│   │   └── interceptors/
│   │       └── authInterceptor.ts
│   ├── components/
│   │   ├── feedback/
│   │   │   └── Toast.tsx
│   │   ├── ui/
│   │   │   └── Button.tsx
│   │   └── layout/
│   │       └── ResizeHandle.tsx
│   ├── config/
│   │   └── env.ts                 # 환경 변수
│   ├── constants/
│   │   └── storageKeys.ts
│   ├── hooks/
│   │   └── useResizeDrag.ts
│   └── utils/
│       └── date.ts
│
├── mocks/                   # 개발용 목업 데이터
│   ├── conversations.ts
│   └── messages.ts
│
└── styles/
    └── index.css            # 전역 스타일 (Tailwind 진입)
```

## 레이어 의존 규칙

상위 레이어만 하위를 임포트한다. 역방향 임포트는 금지.

```
app  →  pages  →  features  →  shared
```

- `features/*` 사이의 직접 의존은 피한다. 필요하면 `shared` 또는 `app` 레벨로 끌어올린다.
- `shared`는 어떤 feature도 알지 못한다.
- `mocks`는 개발 환경에서만 사용.

## Feature 내부 컨벤션

각 feature는 다음 하위 폴더를 필요한 만큼 가진다.

| 폴더          | 역할                                   |
| ------------- | -------------------------------------- |
| `api/`        | HTTP 호출, 스키마, 매퍼                |
| `components/` | 해당 feature 전용 UI                   |
| `hooks/`      | React Query 훅, 도메인 훅              |
| `context/`    | Context + Provider                     |
| `constants/`  | 상수                                   |
| `utils/`      | 순수 헬퍼                              |
| `types.ts`    | feature 공개 타입                      |

## 주요 기술 스택

- **React 19** / **TypeScript 5.9**
- **Vite 8** — 번들러/Dev 서버
- **React Router 7** — 라우팅
- **TanStack Query 5** — 서버 상태
- **Tailwind CSS 4** — 스타일링
- **Zod 4** — 스키마 검증

---

# 재설계안 (v2 · proposed)

현재 구현(FG-1/2/3/7)이 동작은 하지만, 401·LLM 실패·입력 유실 같은 UX 불안정과
[ChatPage.tsx](src/pages/ChatPage.tsx) 비대화 문제가 누적되고 있다. 다음 FG (FG-4 대화 탐색기,
FG-5 맥락/토큰 표시, FG-6 검색, FG-10 환경 설정) 진입 전에 구조를 정리한다.

본 설계는 **BE API 명세 (Phase 2 v0.4, Phase 3 v0.8)** 와 **BE 도메인 패키지 (`domain.{auth, member, chat, llm}`)** 를 정면으로 반영했다.

## BE 명세에서 끌어낸 설계 결정

| BE 사실                                                                              | FE 에 반영                                                              |
| ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| 모든 응답이 `ApiResponse<T>` 래퍼 (`isSuccess`, `code`, `message`, `result`)         | `shared/api/apiResponse.ts` 에서 단일 unwrap. `client.ts` 가 자동 적용. |
| 에러 코드 타입화 (`AUTH_4013` 만료, `LLM_5001` LLM 실패, `BRANCH_4001` 등)           | `shared/api/errorCodes.ts` 에서 코드→사용자 메시지 매핑. Toast 로 노출. |
| Phase 3 SSE 에서 `summary` → `summaryStatus: PENDING` (비동기)                       | `features/chat/hooks/useTurnSummary.ts` — pending 인 turn 폴링·갱신.    |
| `titleStatus: PENDING/GENERATED/USER_EDITED`                                         | `features/branch/hooks/useChatTitle.ts` — placeholder + 폴링.           |
| Phase 3 `GET /chats/{id}/turns` 응답 메시지에 `chatId` 추가                          | `features/chat/api/schemas.ts` 의 `MessageSchema` 에 `chatId` 추가.    |
| 그래프 = `chats[]`(전체) + `turns[]`(window) + `frontier`                            | `features/graph` 가 collapsed branch 를 `chats[] \ turns[]` 차집합으로. |
| `GET /chats/{id}/graph/expand` 로 frontier 확장                                      | `features/graph/hooks/useGraphExpand.ts` 신설.                          |
| Branch CRUD 가 `/chats/{id}/...` 경로 공유 (PATCH /chats/{id} 가 분기 제목 수정 등)  | FE 도 branch 를 chat 안의 sub-feature 로 두고 폴더만 분리 (느슨한 결합).|
| `AUTH_4013` 토큰 만료                                                                | 글로벌 interceptor 가 401 + `AUTH_4013` 매칭 시 자동 로그아웃·리다이렉트.|
| 401 응답 형식 (스트리밍 전)은 ApiResponse, SSE 시작 후 에러는 SSE event             | `shared/api/sseClient.ts` 로 SSE 처리 통합 (현 `messageStream.ts` 일반화).|
| Cancel API 후 `cancelled → done` 수신 대기 (AbortController 즉시 abort 금지)        | `features/chat/api/messageStream.ts` 기존 패턴 유지, 공용화는 안 함.    |

## 새 트리

```
src/
├── main.tsx
│
├── app/                                # 앱 셸
│   ├── App.tsx
│   ├── providers/
│   │   ├── AppProviders.tsx
│   │   ├── QueryProvider.tsx
│   │   ├── ToastProvider.tsx           # NEW — ApiError → 사용자 친화 알림
│   │   └── ThemeProvider.tsx           # NEW — FG-10.3 테마
│   ├── router/
│   │   ├── AppRouter.tsx
│   │   ├── routes.ts
│   │   └── guards/
│   │       ├── ProtectedRoute.tsx
│   │       └── PublicRoute.tsx
│   └── errors/
│       └── AppErrorBoundary.tsx        # NEW — 화이트 스크린 방지
│
├── pages/                              # 얇게: 데이터 훅 + 컴포넌트 조합
│   ├── LoginPage.tsx
│   ├── SignupPage.tsx                  # NEW — 회원가입 분리 (현 LoginPage 안)
│   ├── chat/
│   │   ├── ChatLayout.tsx              # NEW — 사이드바 + 헤더 + Outlet
│   │   ├── NewChatPage.tsx             # 분리 — 빈 화면 + 모델 선택
│   │   └── ConversationPage.tsx        # 분리 — 메시지 리스트 + 입력
│   ├── MyPage.tsx
│   └── SettingsPage.tsx                # NEW — FG-10
│
├── features/                           # BE 도메인 어휘에 맞춤
│   ├── auth/                           # = BE domain.auth (signup/login)
│   │   ├── api/
│   │   │   ├── authApi.ts              # POST /auth/signup, /auth/login
│   │   │   └── schemas.ts              # zod: SignupReq/LoginReq/AuthRes
│   │   ├── components/                 # EmailLoginForm, EmailSignupForm
│   │   ├── hooks/                      # useLogin, useSignup
│   │   ├── store/                      # context/AuthContext + AuthProvider (개명)
│   │   ├── utils/                      # authStorage, errorMessage
│   │   └── types.ts
│   │
│   ├── member/                         # = BE domain.member (구 features/user)
│   │   ├── api/
│   │   │   ├── memberApi.ts            # GET/DELETE /members/me
│   │   │   └── schemas.ts              # MemberResSchema (memberId, email, name, type, profileUrl)
│   │   ├── components/                 # ProfileCard, PlanBadge, PlanCard, UsageMeter, DangerZone, DeleteAccountModal, RecentConversations, StatCard
│   │   ├── hooks/                      # useMe (GET /me), useDeleteAccount
│   │   └── types.ts                    # Member, MemberType
│   │
│   ├── chat/                           # = BE domain.chat (Chat + Turn + Message 묶음)
│   │   ├── api/
│   │   │   ├── chatApi.ts              # POST/GET /chats, GET /chats/{id}, DELETE /chats/{id}
│   │   │   ├── turnApi.ts              # GET /chats/{id}/turns (cursor)
│   │   │   ├── messageApi.ts           # cancel, regenerate, edit
│   │   │   ├── messageStream.ts        # POST /chats/{id}/messages (SSE)
│   │   │   ├── schemas.ts              # Chat/Turn/Message zod + (Phase3) message.chatId 포함
│   │   │   └── mappers.ts              # API DTO ↔ FE Message/Conversation 변환
│   │   ├── components/
│   │   │   ├── messages/               # MessageBubble, MessageList
│   │   │   ├── input/                  # ChatInput, LlmModelSelect
│   │   │   └── header/                 # ChatHeader
│   │   ├── hooks/
│   │   │   ├── useConversations.ts     # GET /chats (offset)
│   │   │   ├── useChatMeta.ts          # GET /chats/{id}
│   │   │   ├── useMessages.ts          # GET /chats/{id}/turns (cursor, infinite)
│   │   │   ├── useSendMessage.ts       # SSE
│   │   │   ├── useRegenerate.ts        # POST .../regenerate
│   │   │   ├── useEditMessage.ts       # PATCH .../{messageId}
│   │   │   ├── useDeleteChat.ts        # DELETE /chats/{id}
│   │   │   └── useTurnSummary.ts       # NEW — summaryStatus:PENDING 폴링 (Phase 3)
│   │   ├── utils/                      # messageHelpers
│   │   ├── constants/                  # llm options
│   │   └── types.ts
│   │
│   ├── conversation-explorer/          # NEW — FG-4 대화 탐색기 (파일 탐색기 UI)
│   │   ├── components/                 # 현 ConvSidebar/ConversationList 이전
│   │   ├── hooks/                      # useExplorerTree (chats + branches 트리화)
│   │   └── types.ts
│   │
│   ├── branch/                         # FG-2 분기 CRUD (BE: chat 도메인 안의 분기 API)
│   │   ├── api/
│   │   │   ├── branchApi.ts            # POST /chats/{id}/branches, PATCH /chats/{id} (제목), DELETE /chats/{id} (cascade)
│   │   │   └── schemas.ts              # BranchReq/Res, titleStatus enum
│   │   ├── components/                 # BranchTitle (titleStatus 별 표시), BranchActions
│   │   ├── hooks/
│   │   │   ├── useCreateBranch.ts
│   │   │   ├── useRenameBranch.ts      # PATCH /chats/{id}
│   │   │   ├── useDeleteBranch.ts      # DELETE /chats/{id} (cascade)
│   │   │   ├── useChatTitle.ts         # NEW — titleStatus:PENDING 폴링
│   │   │   └── useBranchMessages.ts
│   │   └── types.ts                    # Branch, TitleStatus
│   │
│   ├── graph/                          # FG-3 그래프 시각화 (branch 에서 분리)
│   │   ├── api/
│   │   │   ├── graphApi.ts             # GET /chats/{id}/graph, /graph/expand
│   │   │   └── schemas.ts              # ChatNodeDto, TurnNodeDto, FrontierDto
│   │   ├── components/                 # GraphPanel, GraphLegend, FrontierHandle
│   │   ├── hooks/
│   │   │   ├── useGraph.ts             # GET /graph (center + window)
│   │   │   ├── useGraphExpand.ts       # NEW — GET /graph/expand (frontier 확장)
│   │   │   └── useCollapsedBranches.ts # NEW — chats[] \ turns[] 차집합 계산
│   │   ├── utils/                      # depth/edge 계산, isBranchPoint 계산
│   │   └── types.ts                    # Graph, FrontierPoint
│   │
│   ├── search/                         # FG-6 — 사이드바 로컬 검색
│   │   ├── components/                 # SearchInput, SearchResults, SearchPanel
│   │   ├── hooks/                      # useConversationSearch
│   │   └── types.ts
│   ├── settings/                       # FG-10 — 언어/테마/기본 LLM
│   │   ├── components/                 # SettingsSelect
│   │   ├── hooks/                      # useSettings
│   │   ├── utils/                      # settingsStorage(localStorage)
│   │   ├── constants.ts
│   │   └── types.ts
│   ├── billing/                        # NEW (FG-8) — 자리 예약
│   └── export/                         # NEW (FG-9) — 자리 예약
│
├── shared/
│   ├── api/                            # ★ 안정성의 핵심 레이어
│   │   ├── client.ts                   # fetch wrapper. ApiResponse 자동 unwrap.
│   │   ├── endpoints.ts                # 경로 상수 + chatId path helpers
│   │   ├── apiResponse.ts              # NEW — ApiResponse<T> unwrap + 타입
│   │   ├── ApiError.ts                 # NEW — { status, code, message, body }
│   │   ├── errorCodes.ts               # NEW — BE 코드 → 사용자 메시지 매핑
│   │   ├── sseClient.ts                # NEW — 일반화된 SSE (parseBlock, terminal-then-done)
│   │   └── interceptors/
│   │       ├── authInterceptor.ts      # NEW — 401 + AUTH_4013 → 로그아웃·리다이렉트
│   │       └── errorReporter.ts        # NEW — ApiError → Toast 디스패치
│   │
│   ├── components/
│   │   ├── ui/                         # Button, Modal, Spinner, Skeleton, …
│   │   ├── feedback/                   # NEW — Toast, ErrorBanner, EmptyState, PendingBadge
│   │   ├── layout/                     # ResizeHandle, SplitPane
│   │   └── form/                       # NEW — TextInput, FieldError 공용
│   │
│   ├── config/
│   │   └── env.ts
│   ├── constants/
│   ├── hooks/                          # 도메인 무관 (useResizeDrag 등)
│   ├── i18n/                           # NEW — FG-10.2 한/영
│   ├── lib/                            # NEW — 외부 라이브러리 thin wrapper
│   └── utils/
│
├── mocks/
└── styles/
```

## BE 도메인 ↔ FE feature 매핑

| BE                | FE feature                                                              | 비고                                                       |
| ----------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------- |
| `domain.auth`     | `features/auth`                                                         | signup / login                                             |
| `domain.member`   | `features/member`                                                       | `user/` 에서 개명                                          |
| `domain.chat`     | `features/chat` + `features/branch` + `features/graph` + `features/conversation-explorer` | BE 는 한 도메인에 묶지만 FE 는 UI 관심사로 4 분할          |
| `domain.llm`      | `features/chat/constants/llm.ts` + `features/settings`(FG-10.1 LLM 선택)| BE 의 LlmClient 추상화는 FE 에 직접 매핑 안 함             |
| `global.security` | `shared/api/interceptors/authInterceptor.ts`                            | 401 처리 단일 지점                                         |
| `global.error`    | `shared/api/{ApiError,errorCodes,apiResponse}`                          | ApiResponse / 에러 코드 매핑                               |

## SRS FG ↔ 위치

| FG    | 기능              | 위치                                                | 구현 상태 |
| ----- | ----------------- | --------------------------------------------------- | --------- |
| FG-1  | 대화 작성         | `features/chat`                                     | ✅ 일부   |
| FG-2  | 분기 관리         | `features/branch`                                   | ✅ 일부   |
| FG-3  | 그래프 시각화     | `features/graph`                                    | ✅ 일부   |
| FG-4  | 대화 탐색기       | `features/conversation-explorer`                    | 부분 (ConvSidebar) |
| FG-5  | 맥락 관리(토큰)   | `features/chat/components/messages/TokenUsage`      | 미구현 (BE 의존) |
| FG-6  | 저장/검색         | `features/search`                                   | 부분(목록 기반 검색) |
| FG-7  | 계정/인증         | `features/auth` + `features/member`                 | ✅        |
| FG-8  | 구독/결제         | `features/billing`                                  | Phase 4+  |
| FG-9  | 내보내기          | `features/export`                                   | Phase 4+  |
| FG-10 | 환경 설정         | `features/settings` + `pages/SettingsPage.tsx`      | 부분(로컬 설정) |

## 명세 기반 핵심 신설 모듈

1. **`shared/api/apiResponse.ts`** — `ApiResponse<T>` 단일 래퍼 unwrap. 모든 API hook 이 `result` 만 다루도록.
2. **`shared/api/errorCodes.ts`** — `AUTH_4013 → "다시 로그인해 주세요"`, `LLM_5001 → "AI 응답 생성에 실패했어요"` 등 코드 매핑 단일 지점.
3. **`shared/api/ApiError.ts`** — `{status, code, message, body}` 구조. 현 client.ts 의 ApiError 확장.
4. **`shared/api/interceptors/authInterceptor.ts`** — `401 + AUTH_4013` 매칭 시 토큰 정리 + `/login` 리다이렉트. 사용자에겐 "세션이 만료됐어요" 토스트.
5. **`shared/api/sseClient.ts`** — SSE 파서 일반화. `messageStream.ts` 의 로직을 공용화해서 regenerate/edit 도 재사용.
6. **`features/branch/hooks/useChatTitle.ts`** — `titleStatus: PENDING` 인 분기를 폴링하다가 `GENERATED` 되면 캐시 invalidate. 사용자에겐 "제목 생성 중…" 표시.
7. **`features/chat/hooks/useTurnSummary.ts`** — `summaryStatus: PENDING` 폴링 (Phase 3 비동기 분리 대응).
8. **`features/graph/hooks/useGraphExpand.ts`** + **`useCollapsedBranches.ts`** — frontier 확장과 collapsed branch 차집합 계산.
9. **`features/conversation-explorer`** — FG-4 의 "파일 탐색기 유사" UI 를 독립 feature 로. 현재 ConvSidebar 안에 갇혀 있음.

## 이 구조의 장점

1. **현재 불안정의 직접 해결**
   - 401 글로벌 처리 → 토큰 만료 시 자동 로그아웃·리다이렉트 (현재: 콘솔에만 찍히고 끝).
   - BE 에러 코드 → 사용자 친화 메시지 매핑 → "LLM 서비스 호출에 실패했습니다" 같은 raw 백엔드 문구 노출 방지.
   - Toast + ErrorBoundary → 콘솔 안 봐도 사용자가 무슨 일이 났는지 인지.
   - `ApiResponse<T>` unwrap 단일 지점 → 각 hook 에서 `result` 꺼내는 보일러플레이트 제거 + 에러 처리 통일.

2. **BE 명세 변경 흡수성**
   - Phase 3 SSE 스키마 변경 (`turn_completed.summary` 제거) 같은 변경이 와도 `useTurnSummary.ts` 한 군데만 수정.
   - Phase 3 message.chatId 추가도 `features/chat/api/schemas.ts` 한 곳.
   - 비동기 title/summary 패턴이 표준화되어 있어 다음 비동기 필드가 추가돼도 같은 hook 패턴 재사용.

3. **BE 협업 비용 감소**
   - 같은 어휘 (`member`, `chat`, `branch`, `graph`) — "회원 탈퇴 API" 가 어디 있는지 양쪽 모두 직관적.
   - 에러 코드를 FE 가 인지 → BE 가 새 코드 추가 시 어디를 수정해야 하는지 명확 (`errorCodes.ts`).

4. **거대 컴포넌트 분해**
   - `ChatPage.tsx` 450줄 → `ChatLayout` + `NewChatPage` + `ConversationPage`. 디버깅·테스트 용이.
   - `branch` 와 `graph` 분리 → 그래프 렌더링 버그가 분기 CRUD 와 섞이지 않음.

5. **명세상 비동기 처리 모델 일급 시민화**
   - `titleStatus`, `summaryStatus` 의 `PENDING / GENERATED / USER_EDITED` 가 모든 곳에서 1급 데이터.
   - 폴링 hook 이 feature 별로 표준화 → 다른 비동기 필드(예: 향후 FR-5.2 context summary) 추가 용이.

6. **확장성**
   - FG-4/5/6/8/9/10 자리 예약 → 다음 PR 들이 올바른 위치에 들어옴.
   - 각 feature 내부 구조 동일 (`api/components/hooks/types.ts`) → 새 팀원 온보딩 빠름.

7. **테스트 용이성**
   - interceptor, errorCodes, apiResponse 가 분리 → 단위 테스트 모킹 단순.
   - hooks 가 feature 내부에 격리 → 컴포넌트 없이 hook 단독 테스트 가능.

## 마이그레이션은 단계적으로

한 번에 다 옮기면 회귀 위험. 권장 순서:

- **Phase A — 안정성 (코드 이동 0, 추가만)**
  `shared/api/{ApiError, errorCodes, apiResponse}`, `interceptors/authInterceptor`, `ToastProvider`, `AppErrorBoundary`.
  → 즉시 401·LLM 에러·화이트 스크린 문제 해결.

- **Phase B — 도메인 정렬**
  `features/user/` → `features/member/` 개명.
  `features/branch/` 에서 `features/graph/` 분리.
  `conversation-explorer/` 신설하고 ConvSidebar 이전.

- **Phase C — 페이지 분해**
  `ChatPage` → `ChatLayout` + `NewChatPage` + `ConversationPage`.

- **Phase D — Phase 3 SSE/비동기 대응**
  `useChatTitle`, `useTurnSummary`, `useGraphExpand`, `useCollapsedBranches` 도입.
  `messageStream.ts` 를 `shared/api/sseClient.ts` 로 일반화.

- **Phase E — 신규 FG 채우기**
  `search/` 사이드바 검색과 `settings/` 로컬 환경 설정 구현 완료. 메시지 본문 전문 검색과 서버 동기화 설정은 BE 명세/엔드포인트 확정 후 확장.

Phase A 만 끝내도 현재 보고된 불안정의 70% 이상이 해결될 것으로 본다.
