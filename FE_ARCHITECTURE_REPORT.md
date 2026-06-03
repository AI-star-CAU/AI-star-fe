# AIT Frontend Architecture Report

> 분석 대상: `AI-star-fe` (React 19, Vite, TypeScript, TanStack Query, REST + SSE)
> 작성일: 2026-06-03
> 기준 자료: `1 개요.pdf`, `2 Process.pdf`, `4 요구 분석.pdf`, `5 요구 모델링.pdf`, `6 설계 원리.pdf`, `6 설계 원리II.pdf`, `Architecture Design and Patterm.pdf`
> 검증 기준: `npm run lint`, `npm run build`

이 문서는 현재 프론트엔드 구조를 강의에서 다룬 설계 원리 관점으로 분석한 리포트다. 초점은 코드 목록 나열이 아니라 **요구사항이 어떤 아키텍처와 모듈 구조로 옮겨졌는지**, 그리고 그 구조가 **응집도, 결합도, 정보 은닉, SOLID, 패키지 원칙, 품질 속성** 측면에서 얼마나 유지보수 가능한지를 평가하는 것이다.

---

## 1. 평가 프레임

강의 자료의 핵심 개념을 프론트엔드 평가 질문으로 옮기면 다음과 같다.

| 강의 관점 | 핵심 개념 | FE 평가 질문 |
|---|---|---|
| 좋은 소프트웨어 품질 | correctness, maintainability, reliability, usability | 기능이 맞게 동작하면서 변경과 장애에 강한가? |
| 프로세스 | 요구분석 -> 아키텍처 설계 -> 상세 설계 -> 구현 -> 테스트 | 요구 기능이 계층과 모듈 책임으로 자연스럽게 배치됐는가? |
| 요구 분석 | 기능/비기능 요구, 도메인 분리 | feature 경계가 사용자 기능과 도메인 의미를 반영하는가? |
| 요구 모델링 | 인터페이스, 합성, 타입 계약 | 컴포넌트/hook/API 계약이 역할을 명확히 드러내는가? |
| 설계 원리 | 결합도, 응집도, 정보 은닉, 모듈화 | 변경 이유가 같은 코드는 모이고, 불필요한 의존은 숨겨졌는가? |
| SOLID / 패키지 원칙 | SRP, OCP, ISP, DIP, REP/CCP/CRP | 모듈이 단일 책임과 변경 단위를 잘 유지하는가? |
| 아키텍처 스타일/패턴 | Layered, Client-Server, Event-driven, Adapter, Observer | 현재 스타일과 패턴이 채팅/SSE/그래프 요구에 적합한가? |

---

## 2. 현재 아키텍처 요약

AIT FE는 브라우저에서 동작하는 React SPA이며, 백엔드와는 REST API 및 SSE 스트림으로 통신한다. 전체 구조는 다음 계층을 따른다.

```text
app
  -> pages
    -> features
      -> shared
```

이 계층은 "상위 화면이 하위 기능과 공통 인프라를 조립한다"는 방향을 갖는다.

| 계층 | 역할 | 예시 |
|---|---|---|
| `app` | 앱 전체 provider, router, error boundary | `App.tsx`, `AppRouter`, `QueryProvider`, `ToastProvider` |
| `pages` | 라우트 단위 화면 조립 | `LoginPage`, `ChatLayout`, `MyPage`, `SettingsPage` |
| `features` | 사용자 기능 단위 모듈 | `auth`, `chat`, `branch`, `graph`, `conversation-explorer`, `search`, `usage`, `member`, `settings` |
| `shared` | 앱 전역 공통 인프라 | API client, schema, SSE parser, storage helper, UI base components |

런타임 흐름은 다음 형태다.

```text
User Action
  -> Page / Feature Component
  -> Feature Hook
  -> Feature API Module
  -> shared/api client or SSE parser
  -> Backend REST / SSE
  -> Zod schema validation
  -> React Query cache update
  -> UI render
```

채팅 메시지 전송처럼 스트리밍이 필요한 기능은 `fetch` response body를 SSE parser로 읽고, feature별 event handler가 `turn_started`, `chunk`, `turn_completed`, `cancelled`, `error`, `done` 이벤트를 UI 상태로 변환한다.

---

## 3. 요구사항과 설계 매핑

### 3.1 기능 요구 매핑

| 요구 기능 | FE 설계 반영 |
|---|---|
| 인증/회원가입 | `features/auth`, `AuthProvider`, `ProtectedRoute`, `PublicRoute` |
| 채팅 생성/전송 | `features/chat`, `ChatLayout`, `ConversationView`, `useSendMessage`, `messageStream` |
| SSE 응답 스트리밍 | `shared/api/sse`, `features/chat/api/messageStream`, live message merge hooks |
| 분기 생성/수정/삭제 | `features/branch/api`, `useCreateBranch`, `useUpdateBranch`, `useDeleteBranch` |
| 대화 그래프 탐색 | `features/graph`, `GraphPanel`, `useGraph`, `graphBuilders`, `graphLayout` |
| 대화 목록/검색/탐색기 | `features/conversation-explorer`, `features/search`, `ConversationList`, `SearchPanel` |
| 토큰 사용량 | `features/usage`, `features/member/components/UsageMeter` |
| 사용자 설정 | `features/settings`, `shared/storage/settingsStorage` |

### 3.2 비기능 요구 매핑

| 비기능 요구 | FE 설계 반영 |
|---|---|
| 신뢰성 | `AppErrorBoundary`, `ApiError`, toast, 전송 실패 입력 복구, SSE error 처리 |
| 유지보수성 | feature 중심 구조, 공통 API/schema/SSE/storage 인프라, 구조와 의사결정 기록 |
| 성능 | React Query cache, cursor/window 기반 graph expand, pagination, optimistic merge |
| 사용성 | 로딩 skeleton, 입력 복구, 타이핑 효과, 그래프/탐색 UI, 설정 UI |
| 보안 | Authorization header 부착, 만료/무효 토큰 정리, route guard |
| 이식성 | Vite SPA, `env.apiBaseUrl` 기반 API base URL 분리 |

---

## 4. 모듈과 서브시스템 설계

현재 feature 경계는 사용자 기능 단위와 대체로 잘 맞는다.

| 모듈 | 책임 | 설계 평가 |
|---|---|---|
| `features/auth` | 로그인, 회원가입, 세션 복원, auth context | 인증 상태라는 단일 책임이 비교적 명확하다. |
| `features/member` | 내 정보, 회원 탈퇴, 마이페이지 구성 요소 | member page UI와 API가 응집되어 있다. |
| `features/chat` | 메시지 조회/전송/수정/재생성, 채팅 UI | 핵심 도메인이라 크지만 hook/API/component로 역할이 나뉜다. |
| `features/branch` | 분기 생성/수정/삭제 mutation | branch mutation hook이 생겨 UI와 API 정책이 분리되어 있다. |
| `features/graph` | 그래프 API, graph node/edge build, layout, SVG 렌더 | builder/layout/type/constant 분리로 계산 책임이 명확해졌다. |
| `features/conversation-explorer` | 대화 목록, 탐색기, 그래프 패널 조립 | 화면 조립 책임이 남아 있어 상대적으로 넓은 모듈이다. |
| `features/search` | 대화/분기 검색 UI 및 hook | 검색이라는 단일 목적에 집중한다. |
| `features/settings` | 사용자 설정 읽기/쓰기 및 UI | 설정 자체는 응집되어 있으나 LLM option은 chat 상수에 의존한다. |
| `features/usage` | 토큰 사용량 조회/표시 | 기능 목적이 작고 명확하다. |
| `shared/api` | HTTP client, endpoint, schema, SSE, error handling | 저수준 통신 세부를 숨기는 안정 모듈이다. |
| `shared/storage` | token/user/settings storage 접근 | browser storage 정책을 한 경계 안에 숨긴다. |

삭제된 분기 복구 API(`POST /chats/{id}/restore`)는 현재 백엔드 명세와 구현 범위에 없으므로 FE에서 호출하지 않는다. 그래프에서 삭제된 노드는 시각적으로 표시하되, 존재하지 않는 API capability를 사용자 액션으로 노출하지 않는다.

---

## 5. 결합도 분석

강의의 결합도 단계는 다음 순서로 강해진다.

```text
Data Coupling < Stamp Coupling < Control Coupling < Common Coupling < Content Coupling
```

현재 FE는 대체로 Data Coupling 중심이지만, page/container 계층에는 일부 Stamp/Control Coupling이 남아 있다.

| 결합 유형 | 현재 위치 |
|---|---|
| Data Coupling | UI component -> hook -> API module 흐름. props와 인자를 통해 필요한 데이터를 전달한다. |
| Stamp Coupling | `ChatLayout`, `ConvSidebar`, `GraphPanel`이 `Conversation`, `Message`, `GraphResponse` 같은 큰 모델을 함께 조립한다. |
| Control Coupling | `ChatLayout`이 active branch, route state, live message merge 결과에 따라 하위 화면 흐름을 결정한다. |
| Common Coupling | React Query cache key와 browser storage가 공유 상태 역할을 한다. storage는 `shared/storage`로 숨겼지만 cache key 규칙은 여러 feature가 함께 사용한다. |
| Content Coupling | 다른 모듈 내부 상태를 직접 조작하는 구조는 거의 없다. |

의존 관계에서 가장 중요한 개선점은 공통 API schema, SSE parser, storage 접근이 `shared`로 이동했다는 점이다. 이로 인해 feature가 다른 feature 내부 구현에 기대는 경로가 줄었다.

남은 결합 지점은 `chat`, `graph`, `conversation-explorer` 사이의 화면 조립부다. 이 영역은 사용자 흐름상 자연스럽게 연결되지만, 장기적으로는 page/container 계층에서 조립하고 feature 내부는 더 얇은 contract를 제공하는 방향이 좋다.

---

## 6. 응집도 분석

강의 기준 응집도는 다음 순서로 강해진다.

```text
Coincidental < Logical < Temporal < Procedural < Communicational < Sequential < Functional
```

| 모듈 | 응집도 평가 | 근거 |
|---|---|---|
| `features/usage` | Functional | 토큰 사용량 조회/표시라는 단일 목적. |
| `features/auth` | Functional | 인증 상태와 로그인/회원가입 흐름에 집중. |
| `features/settings` | Functional | 로컬 설정 읽기/쓰기와 설정 UI에 집중. |
| `shared/api` | Functional | HTTP/SSE/error/schema라는 통신 인프라에 집중. |
| `shared/storage` | Functional | storage 접근 정책을 한 책임으로 캡슐화. |
| `features/branch` | Functional | 분기 mutation 책임이 hook/API로 분리됨. |
| `features/graph` | Functional | graph build/layout/render가 파일 단위로 나뉘어 graph 책임 안에 머문다. |
| `features/chat` | Communicational + Functional | 메시지 데이터를 중심으로 API, hook, UI가 모인다. 도메인상 자연스럽지만 내부 책임은 크다. |
| `features/conversation-explorer` | Communicational + Procedural | 대화 목록, 검색, 그래프 패널 조립을 함께 다룬다. 화면 조립부 특성상 상대적으로 넓다. |
| `pages/chat/ChatLayout` | Procedural | 라우트 상태, 활성 대화, 분기 context, live message merge를 조립한다. 핵심 계산은 hook으로 분리되어 절차적 책임이 완화됐다. |

---

## 7. SOLID 평가

### 7.1 SRP

| 대상 | 평가 |
|---|---|
| `AuthProvider` | 인증 상태 복원, 로그인/회원가입, 로그아웃을 담당한다. member API 호출이 일부 포함되어 auth/member 경계가 조금 겹친다. |
| `ChatLayout` | route state, active conversation, branch context, live message merge가 hook으로 분리되어 page frame 조립에 가까워졌다. |
| `ConvSidebar` | 목록/검색/그래프 패널을 함께 조립한다. 그래프 fetch/merge/expand는 hook으로 빠졌지만 panel 분리 여지는 남아 있다. |
| `ConversationList.BranchRow` | mutation API와 cache invalidation을 직접 알지 않고 `useUpdateBranch`, `useDeleteBranch`를 사용한다. |
| `GraphPanel` | build/layout/type/constant가 별도 모듈로 이동해 SVG 렌더와 interaction 중심으로 좁아졌다. |
| `shared/api` | HTTP/SSE/error/schema의 공통 통신 책임에 집중한다. |
| `shared/storage` | browser storage 접근 정책에 집중한다. |

### 7.2 OCP

좋은 점:
- 서버 응답 구조 변경은 Zod schema와 mapper에서 흡수할 수 있다.
- SSE 블록 parsing은 `shared/api/sse`에 모여 있어 포맷 변경 시 수정 지점이 줄어든다.
- storage 정책 변경은 `shared/storage` 중심으로 흡수할 수 있다.
- LLM 모델 목록은 `LLM_OPTIONS`로 확장 가능하다.

주의할 점:
- 새 SSE event가 추가되면 chat 전용 event mapping switch를 수정해야 한다.
- Graph view mode가 늘어나면 `GraphPanel`의 render/layout branch가 다시 커질 수 있다.

### 7.3 LSP

프론트엔드는 클래스 상속을 거의 사용하지 않으므로 전통적 LSP 위험은 낮다. 대신 타입 모델이 대체 가능한 계약 역할을 한다. 따라서 `Conversation`, `Branch`, `Message`, `GraphResponse`의 의미가 흔들리지 않아야 한다.

주의할 점은 탐색기/그래프 전환 과정에서 UI fallback 값이 들어가는 모델이다. 예를 들어 `forkAtTurnIndex`를 모를 때의 fallback은 화면에는 유용하지만, 장기적으로는 UI 모델과 API DTO의 경계를 더 분명히 하는 것이 좋다.

### 7.4 ISP

feature hook과 API module은 비교적 작은 인터페이스를 제공한다. 다만 컨테이너 컴포넌트의 props는 아직 넓다.

| 대상 | ISP 관점 |
|---|---|
| `useUpdateBranch`, `useDeleteBranch` | 작은 mutation contract를 제공한다. |
| `useOptimisticGraphMerge` | graph fetch/merge/expand를 하나로 제공한다. ConvSidebar를 가볍게 만들지만 hook 자체 contract는 다소 넓다. |
| `GraphPanel` | `messages`, `conv`, `branchMessagesById`, `graphData`, `onExpand`, `zoom`, `viewMode`를 함께 받는다. legacy/local graph와 API graph를 모두 지원하기 때문이지만 props 폭은 큰 편이다. |
| `ConvSidebar` | conversation list와 graph panel 조립을 모두 담당하므로 props와 내부 의존이 넓다. |

### 7.5 DIP

좋은 점:
- 화면 컴포넌트는 대부분 `fetch`, `localStorage`, raw SSE parsing을 직접 알지 않는다.
- API 세부 구현은 `apiClient`, `streamSSE`, `messageStream`, feature API module 뒤에 숨겨져 있다.
- storage 세부 구현은 `tokenStorage`, `userStorage`, `settingsStorage` 뒤에 숨겨져 있다.

남은 점:
- feature 간 의존이 추상 interface보다 concrete import에 가깝다.
- `conversation-explorer`는 사용자 흐름상 `chat`, `graph`, `branch`와 강하게 연결된다. 이 결합은 page 조립 계층으로 더 끌어올릴 수 있다.

---

## 8. 설계 원리 적용

### 8.1 Abstraction

추상화가 잘 된 지점은 다음과 같다.

- `apiClient.get/post/patch/delete`가 HTTP 요청 세부를 감춘다.
- `apiEnvelope`, `pageResponseSchema`, status schema가 공통 API 응답 형식을 추상화한다.
- `parseSseBlock`, `parseSseStream`이 SSE wire format을 숨긴다.
- `useMessages`, `useGraph`, `useUsage`, `useConversations`가 React Query 세부를 감춘다.
- `graphBuilders`와 `graphLayout`이 API/legacy data를 graph render model로 바꾼다.
- `shared/storage`가 browser storage 접근을 추상화한다.
- semantic color token이 실제 색 의미를 `bg-ui-surface`, `text-ui-text-*`, `border-ui-line` 같은 이름으로 표현한다.

### 8.2 Encapsulation / Information Hiding

현재 구조는 다음 구현 세부를 숨긴다.

| 숨긴 구현 세부 | 경계 |
|---|---|
| API base URL, header, JSON body, HTTP error parsing | `shared/api/client`, `parseHttpError` |
| API response envelope와 pagination schema | `shared/api/schemas` |
| SSE block parsing과 reader lock release | `shared/api/sse` |
| chat SSE event dispatch | `features/chat/api/messageStream` |
| token/user/settings 저장 방식 | `shared/storage/*` |
| graph node/edge 생성과 focused layout | `features/graph/components/graphBuilders`, `graphLayout` |
| toast dispatch | `shared/utils/toastEvents`, `ToastProvider` |

정보 은닉이 아직 약한 지점은 DOM scroll 보조 로직과 넓은 컨테이너 props다. 특히 `MessageList`의 `querySelectorAll([data-turn-id])`는 DOM 구조에 직접 의존한다.

### 8.3 Interface Separation

branch mutation, API schema, SSE parser, storage helper가 분리되면서 인터페이스가 이전보다 작아졌다. 그러나 `GraphPanel`과 `ConvSidebar`는 API data와 legacy/mock-compatible data를 함께 받는 구조라 props가 넓다. 이 부분은 기능 로직보다 렌더 구조를 나누는 작업이 필요하다.

---

## 9. 패키지 설계 원칙

### 9.1 REP

FE는 단일 SPA로 함께 릴리즈된다. 독립 패키지 릴리즈 단위는 아니지만, feature별 논리적 재사용 단위는 존재한다. `shared/api`, `shared/storage`, `shared/components`는 여러 feature가 함께 재사용하는 안정 모듈이다.

### 9.2 CCP

같은 이유로 변하는 코드는 대체로 함께 묶여 있다.

| 변경 이유 | 같이 변하는 위치 |
|---|---|
| 채팅 메시지 contract 변경 | `features/chat/api`, `features/chat/types`, `features/chat/hooks` |
| 그래프 응답/렌더 변경 | `features/graph/api`, `graphBuilders`, `graphLayout`, `GraphPanel` |
| 인증 저장 정책 변경 | `shared/storage/tokenStorage`, `AuthProvider`, auth interceptor |
| 공통 API envelope 변경 | `shared/api/schemas`, feature API parsing |
| 디자인 색상 정책 변경 | `src/styles/index.css` semantic token |

### 9.3 CRP

공통 모듈은 "진짜 함께 쓰이는 것" 중심으로 정리되어 있다.

- `apiEnvelope`, 공통 status/page schema는 `shared/api/schemas`에 있다.
- SSE parser는 `shared/api/sse`에 있다.
- token/user/settings storage helper는 `shared/storage`에 있다.
- 예전 이동 경로 호환 shim은 제거되어 공식 위치가 명확하다.

---

## 10. 아키텍처 스타일과 디자인 패턴

### 10.1 아키텍처 스타일

| 스타일 | 적용 |
|---|---|
| Layered Architecture | `app -> pages -> features -> shared` 계층 구조. |
| Client-Server | FE SPA가 BE REST/SSE API를 호출한다. |
| Component-Based | React component를 화면 조립 단위로 사용한다. |
| Event-Driven | SSE stream, toast event, React Query invalidation으로 상태 변화가 전파된다. |
| Data-Centered | TanStack Query cache가 서버 상태의 중심 저장소 역할을 한다. |

### 10.2 디자인 패턴

| 패턴 | 적용 |
|---|---|
| Facade | `apiClient`, feature API module이 HTTP 세부를 감춘다. |
| Adapter / Mapper | `explorerMappers`, `chatMappers`, graph builders가 서버 DTO를 UI 모델로 바꾼다. |
| Observer-like Event Flow | SSE event handler, toast CustomEvent, React Query invalidation. |
| Provider | `AuthProvider`, `QueryProvider`, `ToastProvider`. |
| Strategy-like Option Table | `LLM_OPTIONS`, settings option tables. |

아키텍처 스타일은 시스템의 큰 구조이고, 디자인 패턴은 그 구조 안에서 반복되는 설계 해법이다. 이 프로젝트는 Layered + Client-Server + Component 구조 위에 Facade, Adapter, Event-driven 패턴을 사용한다.

---

## 11. 품질 속성 평가

| 품질 속성 | 평가 |
|---|---|
| Correctness | API schema 검증과 타입 모델이 서버 응답 contract를 방어한다. |
| Reliability | ErrorBoundary, ApiError, Toast, SSE error/cancel handling, 입력 복구가 있다. |
| Maintainability | feature 분리, 공통 API/SSE/storage 경계, graph pure module 분리로 유지보수성이 높아졌다. |
| Reusability | `shared/api`, `shared/storage`, `shared/components`, feature hooks가 재사용 가능하다. |
| Usability | 로딩 skeleton, 타이핑 효과, 그래프 탐색, 검색, 설정 화면을 제공한다. |
| Performance Efficiency | React Query cache, graph window expand, pagination, optimistic merge를 사용한다. |
| Security | JWT를 Authorization header로 붙인다. token의 실제 저장소는 browser storage이므로 XSS 방어와 httpOnly cookie 전환 가능성은 별도 보안 설계가 필요하다. |
| Portability | Vite SPA와 env 기반 API URL로 배포 환경 전환이 쉽다. |
| Developer Usability | `SUMMARY.md`, `FILE_STRUCTURE.md`, semantic color token, canonical import path가 개발자 혼란을 줄인다. |

---

## 12. 현재 구조에 반영된 주요 설계 개선

현재 코드에는 다음 설계 개선이 반영되어 있다.

| 번호 | 설계 개선 | 현재 구조 |
|---:|---|---|
| 1 | `ChatLayout` 파생 상태 분리 | `useChatRouteState`, `useActiveConversation`, `useBranchContext`, `useLiveMessageMerge`로 route/active/branch/live merge 책임 분리 |
| 2 | `ConvSidebar` graph merge 책임 분리 | `useOptimisticGraphMerge`가 graph fetch, optimistic branch merge, expand, error message를 담당 |
| 3 | Branch mutation hook | `useUpdateBranch`, `useDeleteBranch`가 API 호출과 cache invalidation을 담당 |
| 4 | 공통 API schema shared화 | `shared/api/schemas`가 `apiEnvelope`, page schema, title/summary status schema를 제공 |
| 5 | SSE 처리 통합 | `shared/api/sse`가 SSE parser/stream을 담당하고 `messageStream`은 chat event mapping에 집중 |
| 6 | 비명세 restore 제거 | FE는 `POST /chats/{id}/restore`를 호출하지 않고 삭제 노드는 읽기 전용 상태로 표시 |
| 7 | `GraphPanel` 순수 모듈 분리 | `graphTypes`, `graphConstants`, `graphBuilders`, `graphLayout`로 build/layout/constant/type 분리 |
| 8 | semantic design token | `--color-surface`, `--color-text`, `--color-line`, `--color-accent`와 `ui-*` utility 사용 |
| 9 | re-export shim 정리 | 이동된 파일의 호환 shim과 미사용 중복 hook 제거, canonical import path 유지 |
| 10 | storage 경계 통합 | `shared/storage`가 token/user/settings browser storage 접근을 담당 |

이 개선들은 사용자 기능을 크게 바꾸지 않고 설계 품질을 올리는 방향이다. 핵심 효과는 다음 세 가지다.

- 큰 UI 조립 파일에서 파생 상태와 순수 계산을 분리했다.
- feature 사이에 흩어져 있던 공통 contract를 `shared`로 옮겼다.
- 실제 명세에 없는 기능을 UI/API 경계에서 노출하지 않도록 정리했다.

---

## 13. 아키텍처 평가 시나리오

SAAM/ATAM 관점에서 변경 시나리오를 적용하면 다음과 같다.

| 시나리오 | 현재 구조의 반응 | 평가 |
|---|---|---|
| BE 탐색기 응답 구조가 바뀐다 | Zod schema, API module, mapper를 수정하면 UI 영향이 줄어든다. | Adapter/Mapper 구조가 효과적이다. |
| SSE event 포맷이 바뀐다 | 공통 parser는 `shared/api/sse`, chat event mapping은 `messageStream`에서 수정한다. | parser 중복이 없어 수정 누락 위험이 낮다. |
| 새 LLM model/provider가 추가된다 | `LLM_OPTIONS`, 관련 schema/type, settings option을 수정한다. | 확장 가능하지만 LLM 상수 위치는 개선 여지가 있다. |
| graph view mode가 추가된다 | `GraphPanel` render/layout branch가 커질 수 있다. | `graphRendering`, `useGraphViewport` 분리 여지가 있다. |
| storage 정책을 sessionStorage/cookie로 바꾼다 | `shared/storage/tokenStorage` 중심으로 수정한다. | FE 영향 범위는 줄었지만 httpOnly cookie는 BE contract 변경이 필요하다. |
| 삭제 분기 복구 기능이 정식 명세로 추가된다 | endpoint, response schema, mutation hook, graph UI action을 새 contract로 추가한다. | 현재 비명세 호출은 없으므로 명세 기반으로 깨끗하게 추가 가능하다. |

---

## 14. 종합 평가

§1의 강의 metric을 기준으로 현재 구조를 평가하면 다음과 같다.

| 항목 | 평가 | 핵심 근거 |
|---|---|---|
| 추상화 | A- | REST/SSE/storage/DTO 변환이 API, hook, mapper, storage helper 뒤에 숨겨져 있다. DOM scroll 보조처럼 UI 구현 세부에 직접 닿는 지점은 일부 남아 있다. |
| 모듈화 | B+ | feature 계층이 명확하고 큰 컴포넌트의 핵심 로직이 hook/순수 모듈로 나뉘었다. JSX 렌더 분리는 아직 남아 있다. |
| 정보 은닉 | A- | API endpoint, schema, SSE parser, token/user/settings storage가 `shared` 경계로 모였다. 명세에 없는 restore capability도 UI에서 숨겼다. |
| 결합도 | B | 공통 schema/SSE/storage/shim 정리로 불필요한 경로는 줄었다. 다만 chat/graph/explorer 조립부는 사용자 흐름상 concrete dependency가 남아 있다. |
| 응집도 | B+ | usage/auth/settings/branch/graph pure modules는 응집도가 높다. `ConvSidebar`의 목록 + 그래프 패널 조립 책임은 상대적으로 넓다. |
| SRP | B+ | `ChatLayout`, `ConvSidebar`, `GraphPanel`, `BranchRow`의 주요 책임 집중이 완화됐다. 렌더 컴포넌트 세분화는 남아 있다. |
| OCP | B+ | schema/mapper/SSE parser/storage helper로 변경 흡수가 쉬워졌다. 신규 graph view mode와 SSE event dispatch는 직접 수정이 필요하다. |
| LSP | A- | 상속 구조가 거의 없어 위험이 낮다. UI 모델 fallback 값의 의미 일관성은 관리해야 한다. |
| ISP | B | feature hook/API는 작은 contract를 제공한다. 컨테이너 props는 여전히 넓다. |
| DIP | B+ | 화면은 API facade, hook, storage helper에 의존한다. feature 간 concrete import는 일부 남아 있다. |
| 아키텍처 적합성 | A- | Layered + Client-Server + Component + Event-driven 조합이 채팅, SSE, 그래프 탐색 요구에 잘 맞는다. |

종합적으로 현재 FE는 단순 prototype 수준의 조립 구조를 넘어, 강의 metric 기준으로 **B+에서 A- 사이의 유지보수 가능한 구조**에 도달해 있다. 특히 공통 API contract, SSE parser, storage policy, design token, graph pure module 분리는 변경 영향 범위를 줄이는 데 효과적이다.

---

## 15. 강점

유지해야 할 강점은 다음과 같다.

- `app -> pages -> features -> shared` 계층 방향이 명확하다.
- 요구 기능이 feature 단위와 대체로 잘 대응한다.
- REST API, SSE, error, schema, storage가 공통 인프라로 묶여 있다.
- Zod schema로 서버 응답을 런타임 검증한다.
- React Query를 통해 server state cache, staleTime, invalidation을 관리한다.
- graph build/layout이 pure module로 분리되어 테스트 가능성이 높아졌다.
- semantic color token으로 디자인 의도가 class 이름에 드러난다.
- ErrorBoundary, Toast, 입력 복구 등 사용자 실패 경험을 줄이는 장치가 있다.
- `SUMMARY.md`, `FILE_STRUCTURE.md`로 구조와 주요 의사결정이 추적된다.

---

## 16. 남은 개선 제안

현재 구조에서 가장 가치 있는 다음 개선은 기능 로직보다 렌더 구조와 contract 정리다.

| 개선 축 | 설명 | 우선순위 |
|---|---|---|
| `ConvSidebar` 패널 분리 | `ConversationExplorerPanel`, `GraphSidebarPanel`로 목록/그래프 조립 책임을 나눌 수 있다. | 중 |
| `GraphPanel` 렌더 분리 | `graphRendering.tsx`, `useGraphViewport`로 SVG render와 viewport interaction을 나눌 수 있다. | 중 |
| UI model contract 정리 | `Conversation`, `Branch`, graph DTO fallback 값을 명확한 mapper output으로 분리한다. | 중 |
| feature 간 concrete import 축소 | page/container 계층이 데이터를 조립하고 feature는 작은 interface를 제공하도록 조정한다. | 중 |
| auth storage 정책 고도화 | httpOnly cookie 전환은 FE helper 변경만으로 끝나지 않으므로 BE contract와 함께 설계한다. | 낮음~중 |
| SSE event registry | event 종류가 늘어나면 switch 대신 registry/handler table 구조를 고려한다. | 낮음 |

---

## 17. 체크리스트

- [x] What vs How 구분
- [x] 요구 기능과 feature mapping
- [x] 아키텍처 스타일 식별
- [x] 모듈/컴포넌트/runtime 관점 구분
- [x] 결합도 분석
- [x] 응집도 분석
- [x] SOLID 평가
- [x] REP/CCP/CRP 평가
- [x] 정보 은닉과 추상화 평가
- [x] 디자인 패턴 식별
- [x] 품질 속성 평가
- [x] 아키텍처 평가 시나리오 정리
- [x] 남은 개선 축 정리
