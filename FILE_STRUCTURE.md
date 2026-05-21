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
│   ├── providers/
│   │   ├── AppProviders.tsx       # 모든 Provider 조합
│   │   └── QueryProvider.tsx      # React Query 설정
│   └── router/
│       ├── AppRouter.tsx
│       ├── routes.ts
│       └── guards/
│           ├── ProtectedRoute.tsx # 인증 필요 라우트
│           └── PublicRoute.tsx    # 비인증 전용 라우트
│
├── pages/                   # 라우트 단위 페이지
│   ├── LoginPage.tsx
│   ├── ChatPage.tsx
│   └── MyPage.tsx
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
│   │   │   ├── useConversations.ts
│   │   │   ├── useDeleteChat.ts
│   │   │   ├── useEditMessage.ts
│   │   │   ├── useMessages.ts
│   │   │   ├── useRegenerate.ts
│   │   │   └── useSendMessage.ts
│   │   ├── utils/
│   │   │   └── messageHelpers.ts
│   │   └── types.ts
│   │
│   ├── branch/              # 대화 브랜치/그래프
│   │   ├── api/
│   │   │   ├── branchApi.ts
│   │   │   └── schemas.ts
│   │   ├── components/
│   │   │   ├── GraphLegend.tsx
│   │   │   └── GraphPanel.tsx
│   │   ├── hooks/
│   │   │   ├── useBranchMessages.ts
│   │   │   └── useGraph.ts
│   │   └── types.ts
│   │
│   └── user/                # 사용자 프로필/마이페이지
│       └── components/
│           ├── DangerZone.tsx
│           ├── DeleteAccountModal.tsx
│           ├── PlanBadge.tsx
│           ├── PlanCard.tsx
│           ├── ProfileCard.tsx
│           ├── RecentConversations.tsx
│           ├── StatCard.tsx
│           └── UsageMeter.tsx
│
├── shared/                  # 공용 모듈 (도메인 무관)
│   ├── api/
│   │   ├── client.ts              # HTTP 클라이언트
│   │   ├── endpoints.ts           # 엔드포인트 상수
│   │   └── sse.ts                 # SSE 헬퍼
│   ├── components/
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
