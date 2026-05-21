# 변경 사항 요약 (Summary)

이 문서는 작업할 때마다 **무엇을 수정했는지** 팀원에게 공유하기 위한 변경 로그입니다.
새 변경은 **맨 위에 추가**합니다.

## 작성 규칙

- 새 항목은 파일 **상단**(`## 작성 규칙` 아래)에 추가합니다.
- 각 항목은 다음 형식을 따릅니다.

```markdown
## YYYY-MM-DD — 작업자 (한 줄 제목)

**유형:** feat | fix | refactor | docs | chore | style | test
**범위:** features/chat, shared/api, ...

### 변경 내용
- 무엇을 바꿨는지 (불릿)
- ...

### 영향 범위
- 다른 팀원이 알아야 할 사이드 이펙트 / 깨질 수 있는 부분
- 새로 추가된 API, 환경변수, 의존성 등

### 관련
- 이슈/PR: #123
- 관련 파일: [경로](상대경로)
```

- 유형 가이드
  - `feat` — 새 기능
  - `fix` — 버그 수정
  - `refactor` — 동작 변경 없는 구조 개선
  - `docs` — 문서만 수정
  - `chore` — 설정/빌드/의존성
  - `style` — 포매팅·세미콜론 등
  - `test` — 테스트 추가/수정
- 깨짐 위험(Breaking)이 있으면 제목 앞에 `[BREAKING]` 을 붙입니다.

---

## 2026-05-21 — Codex (FILE_STRUCTURE/SUMMARY 역할 분리)

**유형:** docs
**범위:** repo root (AI-star-fe)

### 변경 내용
- [FILE_STRUCTURE.md](./FILE_STRUCTURE.md)는 실제 파일/폴더 구조와 레이어 방향만 남기도록 정리.
- [FILE_STRUCTURE.md](./FILE_STRUCTURE.md)의 각 파일/폴더에 한 줄 역할 설명을 추가.
- Feature 현황, BE 도메인 매핑, SRS FG 위치는 이 문서(SUMMARY)로 이동.

### Feature 현황
| feature | 담당 기능 | 상태 |
| ------- | --------- | ---- |
| `auth` | 로그인, 회원가입, 인증 상태 | 구현 |
| `member` | 마이페이지 프로필/플랜/사용 현황 UI | 구현 |
| `chat` | 대화 생성, 메시지 조회/송신, SSE, 재생성/수정 | 구현 |
| `branch` | 분기 생성/수정/삭제/복구 API와 분기 메시지 훅 | 구현 |
| `graph` | 분기 그래프 조회/확장/표시 | 구현 |
| `conversation-explorer` | 좌측 대화 목록과 사이드바 | 구현 |
| `search` | 사이드바 내 대화/분기 제목 검색 | 부분 구현 |
| `settings` | 로컬 환경 설정, 기본 LLM 모델 선택 | 부분 구현 |

### BE 도메인과 FE feature 매핑
| BE 도메인 | FE 위치 | 비고 |
| --------- | ------- | ---- |
| `domain.auth` | `features/auth` | 로그인/회원가입 |
| `domain.member` | `features/member`, `features/auth/api/memberApi.ts` | 내 정보/회원 탈퇴, 마이페이지 UI |
| `domain.chat` | `features/chat`, `features/branch`, `features/graph`, `features/conversation-explorer`, `features/search` | BE는 chat 도메인 중심, FE는 UI 관심사별 분리 |
| `domain.llm` | `features/chat/constants/llm.ts`, `features/settings` | 새 대화 생성 시 provider/model 선택 |
| `global.security` | `shared/api/interceptors/authInterceptor.ts` | 인증 만료 처리 |
| `global.apiPayload` | `shared/api/{ApiError,apiResponse,errorCodes,parseHttpError}` | ApiResponse/에러 코드 처리 |

### SRS FG 위치
| FG | 기능 | FE 위치 | 상태 |
| -- | ---- | ------- | ---- |
| FG-1 | 대화 작성 | `features/chat`, `pages/chat` | 구현 |
| FG-2 | 분기 관리 | `features/branch` | 구현 |
| FG-3 | 그래프 시각화 | `features/graph` | 구현 |
| FG-4 | 대화 탐색기 | `features/conversation-explorer` | 구현 |
| FG-5 | 맥락/토큰 표시 | 미정 | 미구현 |
| FG-6 | 검색 | `features/search` | 부분 구현 |
| FG-7 | 계정/인증 | `features/auth`, `features/member` | 구현 |
| FG-8 | 구독/결제 | 미정 | 미구현 |
| FG-9 | 내보내기 | 미정 | 미구현 |
| FG-10 | 환경 설정 | `features/settings`, `pages/SettingsPage.tsx` | 부분 구현 |

### 영향 범위
- 코드 변경 없음. 문서만 수정.

### 관련
- 관련 파일: [FILE_STRUCTURE.md](./FILE_STRUCTURE.md)

## 2026-05-21 — Codex (Phase E 검색/설정 자리 구현)

**유형:** feat
**범위:** features/search, features/settings, pages, app/router, shared/constants

### 변경 내용
- **E.1 — `features/search` 연결 (FG-6)**
  - [src/features/search/components/SearchPanel.tsx](./src/features/search/components/SearchPanel.tsx) 추가.
  - 기존 `SearchInput`/`SearchResults`/`useConversationSearch`를 [ConversationList](./src/features/conversation-explorer/components/ConversationList.tsx)에 연결해 사이드바에서 대화 제목, preview, 분기 제목을 검색할 수 있게 함.
  - BE 검색 API가 명세에 없어 메시지 본문 전문 검색은 구현하지 않고 FE가 이미 로드한 대화 목록 범위로 제한.
- **E.2 — `features/settings` + `SettingsPage` 구현 (FG-10)**
  - 신규: [src/features/settings/types.ts](./src/features/settings/types.ts), [constants.ts](./src/features/settings/constants.ts), [utils/settingsStorage.ts](./src/features/settings/utils/settingsStorage.ts), [hooks/useSettings.ts](./src/features/settings/hooks/useSettings.ts), [components/SettingsSelect.tsx](./src/features/settings/components/SettingsSelect.tsx).
  - [src/pages/SettingsPage.tsx](./src/pages/SettingsPage.tsx) 추가 및 `/settings` 보호 라우트 연결.
  - [src/shared/constants/storageKeys.ts](./src/shared/constants/storageKeys.ts)에 `SETTINGS` 키 추가. 설정은 서버 API 없이 localStorage에 저장.
  - 새 채팅의 기본 LLM 모델이 저장된 설정값을 초기 선택으로 사용하도록 [ChatLayout](./src/pages/chat/ChatLayout.tsx)을 연결.
  - [ChatHeader](./src/features/chat/components/ChatHeader.tsx) 사용자 메뉴에 환경 설정 링크 추가.
- **빌드 차단 타입 오류 정리**
  - `features/search/types.ts`의 `Branch` import 경로를 `features/branch/types`로 수정.
  - `useEditMessage`/`useRegenerate`의 `ApiError` 생성자 인자(`code`) 누락 수정.
  - `useRegenerate.ts`의 불필요한 `3` 토큰 제거.
- **lint 정리**
  - Fast Refresh 규칙에 맞게 토스트 이벤트 헬퍼를 [src/app/providers/toastEvents.ts](./src/app/providers/toastEvents.ts)로 분리.
  - `MessageBubble`/`MessageList` hook dependency 경고를 정리.

### 영향 범위
- 검색은 현재 BE 명세상 별도 search endpoint가 없으므로 `GET /chats`로 로드된 목록 안에서만 동작.
- 설정은 서버 동기화 없이 브라우저 localStorage 기반. 기본 LLM 모델은 새 대화 생성 전에만 반영되며, 기존 대화 모델은 바꾸지 않음.
- `npm.cmd run lint`, `npm.cmd run build` 통과 확인. PowerShell의 `npm.ps1`은 실행 정책으로 막혀 `npm.cmd`를 사용함.

### 관련
- 관련 파일: [FILE_STRUCTURE.md](./FILE_STRUCTURE.md), [src/features/search](./src/features/search), [src/features/settings](./src/features/settings), [src/pages/SettingsPage.tsx](./src/pages/SettingsPage.tsx)
- 참조 명세: BE Phase 2 v0.4 `POST /chats`의 `llmProvider`/`llmModel`, `GET /chats` 목록 제공

## 2026-05-21 — Claude (Phase B 마이그레이션 — 도메인 정렬)

**유형:** refactor
**범위:** features/* (구조 변경)

### 변경 내용
- **B.1 — `features/user/` → `features/member/`**
  - 폴더 전체 이동. BE `domain.member` 어휘와 통일.
  - [pages/MyPage.tsx](./src/pages/MyPage.tsx) 임포트 7개 갱신 (`../features/user/components/*` → `../features/member/components/*`).
- **B.2 — `features/graph/` 신설 (`features/branch/` 에서 분리)**
  - 신규: [src/features/graph/types.ts](./src/features/graph/types.ts), [api/schemas.ts](./src/features/graph/api/schemas.ts), [api/graphApi.ts](./src/features/graph/api/graphApi.ts), [components/GraphPanel.tsx](./src/features/graph/components/GraphPanel.tsx), [components/GraphLegend.tsx](./src/features/graph/components/GraphLegend.tsx), [hooks/useGraph.ts](./src/features/graph/hooks/useGraph.ts).
  - `branch/types.ts` 슬림화 — Branch, TitleStatus, CreateBranchRequest/Response, UpdateBranchRequest 만 유지. ChatNodeDto, TurnNodeDto, Frontier*, GraphResponse, ExpandGraphResponse, SummaryStatus, NodeAction → `graph/types.ts` 로 이동.
  - `branch/api/schemas.ts` 슬림화 — TitleStatusSchema, CreateBranchResponseSchema, apiEnvelope 만 유지. 그래프 관련 zod 스키마 7개 → `graph/api/schemas.ts` 로 이동.
  - `branch/api/branchApi.ts` 슬림화 — createBranch, updateBranch, deleteBranch, restoreBranch 만 유지. getGraph, expandGraph → `graph/api/graphApi.ts` 로 이동.
  - [ChatPage.tsx](./src/pages/ChatPage.tsx) — `useGraph` 임포트 경로를 branch → graph 로.
- **B.3 — `features/conversation-explorer/` 신설 (FG-4)**
  - 신규: [components/ConvSidebar.tsx](./src/features/conversation-explorer/components/ConvSidebar.tsx), [components/ConversationList.tsx](./src/features/conversation-explorer/components/ConversationList.tsx), [hooks/useConversations.ts](./src/features/conversation-explorer/hooks/useConversations.ts).
  - 원본은 `features/chat/components/` 및 `features/chat/hooks/` 에서 삭제.
  - 새 위치에서 임포트 정정: GraphPanel/useGraph → `graph/...`, branchApi.expandGraph → graphApi.expandGraph, chat 타입 경로 조정.
  - [ChatPage.tsx](./src/pages/ChatPage.tsx), [MyPage.tsx](./src/pages/MyPage.tsx) — `useConversations`/`ConvSidebar` 임포트 갱신.

### 영향 범위
- **API 표면 변화**
  - `branchApi.expandGraph` / `branchApi.getGraph` 제거 → `graphApi.expandGraph` / `graphApi.getGraph` 사용. 외부에서 호출 중인 곳은 ConvSidebar 한 곳뿐(이미 갱신).
  - `features/branch/types.ts` 에서 graph 타입들이 빠짐. 외부 import 는 ChatPage(branch type), ConvSidebar(둘 다)뿐(모두 갱신).
- **타입체크** `npx tsc --noEmit` 통과 확인.
- **잔여 빈 폴더** `features/branch/components/` 는 현재 비어있음. 추후 branch CRUD UI (`BranchTitle`, `BranchActions`) 자리로 사용.

### 관련
- 관련 파일: 위 신규/수정 목록
- 참조 명세: BE `package_by_domain.md` (domain.member 어휘), BE Phase 3 §3 (그래프 API)

---

## 2026-05-21 — Claude (Phase A 마이그레이션 — 안정성 인프라 도입)

**유형:** feat
**범위:** shared/api, app/providers, app/errors, features/chat

### 변경 내용
- **신규 파일**
  - [src/shared/api/ApiError.ts](./src/shared/api/ApiError.ts) — `{status, code, message, body}` 형태로 분리. BE 의 타입화된 에러 코드 노출.
  - [src/shared/api/apiResponse.ts](./src/shared/api/apiResponse.ts) — `ApiResponse<T>` 타입 정의.
  - [src/shared/api/errorCodes.ts](./src/shared/api/errorCodes.ts) — BE 에러 코드(`AUTH_4011`, `AUTH_4013`, `LLM_5001`, `BRANCH_4001`, …) → 사용자 친화 한국어 메시지 매핑 + `resolveErrorMessage()` 헬퍼 + `AUTH_BROKEN_CODES` 집합.
  - [src/shared/api/interceptors/authInterceptor.ts](./src/shared/api/interceptors/authInterceptor.ts) — `handleAuthBroken()`. 401 + `AUTH_4011`/`AUTH_4013` 일 때 localStorage 정리 + 토스트 + `/` 리다이렉트 (이미 로그인 화면이면 리다이렉트 생략).
  - [src/shared/components/feedback/Toast.tsx](./src/shared/components/feedback/Toast.tsx) — Toast 단위 컴포넌트 (success/error/info).
  - [src/app/providers/ToastProvider.tsx](./src/app/providers/ToastProvider.tsx) — `window.dispatchEvent('app:toast', ...)` 로 어디서든 호출. React 트리 밖(인터셉터, SSE 핸들러)에서도 사용 가능하도록 CustomEvent 채택. `showToast(type, message)` 헬퍼 export.
  - [src/app/errors/AppErrorBoundary.tsx](./src/app/errors/AppErrorBoundary.tsx) — 렌더 오류 시 화이트 스크린 대신 새로고침 안내.

- **수정 파일**
  - [src/shared/api/client.ts](./src/shared/api/client.ts) — `ApiError` 를 새 파일에서 import + re-export. 에러 응답에서 `code` 파싱. `handleAuthBroken()` 호출.
  - [src/features/chat/api/messageStream.ts](./src/features/chat/api/messageStream.ts) — `ApiError` 새 시그니처(`status, message, code, body`) 적용. 스트림 시작 전 401 에 `handleAuthBroken()` 연결. SSE `event: error` 에서도 BE `code` 전파.
  - [src/app/providers/AppProviders.tsx](./src/app/providers/AppProviders.tsx) — `AppErrorBoundary` + `ToastProvider` 로 트리 감쌈.
  - [src/features/chat/hooks/useSendMessage.ts](./src/features/chat/hooks/useSendMessage.ts) — `sendMessage` 가 `Promise<boolean>` 반환. 실패 시 `toastFromError()` (resolveErrorMessage 사용). chat 생성 실패 시 더미 FAILED AI 풍선 제거(사용자 메시지만 보존).
  - [src/pages/ChatPage.tsx](./src/pages/ChatPage.tsx) — `handleSend` 가 `sendMessage` 결과 await, 실패 시 `setInput(content)` 로 입력 복구 (NFR-U-4).

### 영향 범위
- **즉시 해결되는 문제**
  - 토큰 만료 시 콘솔에만 에러 찍히고 끝나는 문제 → 자동 로그아웃 + 토스트 + 로그인 리다이렉트.
  - "LLM 서비스 호출에 실패했습니다" 같은 raw 백엔드 문구 → 한국어 사용자 메시지로 매핑.
  - 전송 실패 시 입력값 유실 → 자동 복구.
  - 렌더 오류로 화이트 스크린 → 재시도 안내 화면.
- **API 변경 사항 (호환성)**
  - `ApiError` 생성자 시그니처 변경: `(status, message, body)` → `(status, message, code, body)`. `messageStream.ts` 외부에서 `new ApiError(...)` 호출하는 코드는 없으므로 전역 영향 없음. 다만 외부 contributor 가 ApiError 를 직접 생성하면 컴파일 에러.
  - `useSendMessage().sendMessage` 가 `Promise<void>` → `Promise<boolean>` 으로 변경. 기존 호출자(`ChatPage.handleSend`)만 await 반영, 다른 곳에서는 반환값 무시해도 호환.

### 관련
- 관련 파일: 위 신규/수정 파일 목록
- 참조 명세: BE Phase 2 §0.3 (`ApiResponse<T>`), §0.5 (에러 코드), SRS NFR-U-4 (입력 보존)

---

## 2026-05-21 — Claude (FE 파일 구조 재설계안 추가 — BE 명세 반영)

**유형:** docs
**범위:** repo root (AI-star-fe)

### 변경 내용
- [FILE_STRUCTURE.md](./FILE_STRUCTURE.md) 끝에 **"재설계안 (v2 · proposed)"** 섹션 추가.
- SRS v1.4 (FG-1~10) + BE Phase 2 API v0.4 + BE Phase 3 API v0.8 + BE 도메인 패키지(`domain.{auth, member, chat, llm}`) 를 정면으로 반영.
- 핵심 신설:
  - `shared/api/{ApiError, errorCodes, apiResponse}` — BE `ApiResponse<T>` 래퍼 unwrap, 에러 코드(`AUTH_4013`, `LLM_5001` 등) → 사용자 메시지 매핑.
  - `shared/api/interceptors/authInterceptor` — 401 + `AUTH_4013` 글로벌 처리.
  - `app/providers/ToastProvider` + `app/errors/AppErrorBoundary` — UX 안정성.
  - `features/user/` → `features/member/` 개명 (BE 어휘 일치).
  - `features/branch/` 에서 `features/graph/` 분리.
  - `features/conversation-explorer/` 신설 (FG-4).
  - `features/branch/hooks/useChatTitle`, `features/chat/hooks/useTurnSummary` — Phase 3 비동기 `titleStatus / summaryStatus PENDING` 폴링 대응.
  - `features/graph/hooks/{useGraphExpand, useCollapsedBranches}` — Phase 3 frontier/collapsed branch 모델 대응.
  - `pages/chat/` 폴더로 `ChatPage.tsx`(450줄) 분해 (Layout + NewChatPage + ConversationPage).
  - `features/{search, settings, billing, export}/` 빈 폴더로 자리 예약.
- 마이그레이션 단계 A~E 권장 순서 명시.

### 영향 범위
- 코드 변경 없음. 설계 문서만 추가.
- 실제 마이그레이션은 Phase A(안정성: interceptor + ErrorBoundary + Toast) 부터 별 PR 로 진행 권장.

### 관련
- 관련 파일: [FILE_STRUCTURE.md](./FILE_STRUCTURE.md)
- 참조 문서: AIT_SRS_v1.4.pdf, AI-star-be/phase2_document/api_phase2_v4.md, AI-star-be/phase3_document/api_phase3_v4.md, AI-star-be/package_by_domain.md

---

## 2026-05-21 — Claude (CLAUDE.md 에 문서 갱신 규칙 추가)

**유형:** docs
**범위:** repo root (AI-star-fe)

### 변경 내용
- [CLAUDE.md](./CLAUDE.md) 에 `5. 변경 사항 기록 (필수)` 섹션 추가
  - 모든 수정 후 [SUMMARY.md](./SUMMARY.md) 상단에 변경 항목을 추가하도록 명시
  - 파일/폴더 추가·삭제·이름 변경·이동, 새 feature 추가, 레이어 변경 시 [FILE_STRUCTURE.md](./FILE_STRUCTURE.md) 도 함께 수정하도록 명시

### 영향 범위
- 코드 변경 없음.
- 앞으로 모든 작업은 작업 종료 시 SUMMARY.md(필수), FILE_STRUCTURE.md(구조 변경 시) 갱신을 포함해야 합니다.

### 관련
- 관련 파일: [CLAUDE.md](./CLAUDE.md), [SUMMARY.md](./SUMMARY.md), [FILE_STRUCTURE.md](./FILE_STRUCTURE.md)

---

## 2026-05-21 — Claude (프로젝트 문서 추가)

**유형:** docs
**범위:** repo root (AI-star-fe)

### 변경 내용
- [FILE_STRUCTURE.md](./FILE_STRUCTURE.md) 추가 — `src/` 전체 트리, 레이어 의존 규칙, feature 내부 컨벤션 정리
- [SUMMARY.md](./SUMMARY.md) 추가 — 팀 공유용 변경 로그 템플릿 (이 문서)

### 영향 범위
- 코드 변경 없음. 문서만 추가됨.
- 앞으로 모든 작업 후 이 파일에 변경 사항을 기록해 주세요.

### 관련
- 관련 파일: [FILE_STRUCTURE.md](./FILE_STRUCTURE.md)
