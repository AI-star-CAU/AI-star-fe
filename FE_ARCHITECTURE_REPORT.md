# AIT Frontend - 강의 설계 원리 기반 아키텍처 분석

> 출처 강의: `1 개요.pdf`, `2 Process.pdf`, `4 요구 분석.pdf`, `5 요구 모델링.pdf`, `6 설계 원리.pdf`, `6 설계 원리II.pdf`, `Architecture Design and Patterm.pdf`
> 분석 대상: `AI-star-fe` (`prototype` branch, React 19, Vite, TypeScript, TanStack Query, REST + SSE)
> 작성일: 2026-06-03
> 갱신: 2026-06-03 — Refactoring **#3·#4·#5 적용 완료** 결과를 §4·§6·§8·§9·§11·§14 에 반영(동작 변경 없음).

본 문서는 백엔드 보고서의 문체가 아니라, 강의자료에서 제시한 개념을 평가 기준으로 삼아 현재 프론트엔드 프로젝트를 진단한다. 기준은 **좋은 소프트웨어 품질, What/How 분리, 요구/도메인 분석, 아키텍처 설계, 결합도/응집도, SOLID, 컴포넌트/패키지 원칙, 아키텍처 스타일, 디자인 패턴** 이다.

---

## 0. 강의 자료에서 가져온 평가 프레임

강의자료의 흐름에 맞춰 FE를 다음 질문들로 평가한다.

| 강의자료 | 핵심 개념 | FE 분석 질문 |
|---|---|---|
| `1 개요.pdf` | 좋은 소프트웨어 품질: correctness, maintainability, reusability, usability, reliability 등 | 현재 FE 구조가 유지보수성/재사용성/사용성을 높이는가? |
| `2 Process.pdf` | 요구분석 -> 시스템 설계(architecture design) -> 상세 설계 -> 구현 -> 테스트/유지보수 | 현재 FE는 요구 기능을 어떤 설계 구조로 옮겼는가? 변경과 테스트가 쉬운가? |
| `4 요구 분석.pdf` | 기능 요구/비기능 요구, 도메인/서브도메인, DDD의 bounded context | FE feature 분리가 사용자 기능과 도메인 의미를 반영하는가? |
| `5 요구 모델링.pdf` | 인터페이스, 다형성, 상속/합성의 tradeoff, UML 역할 표현 | 컴포넌트와 hook/API 계약이 명확한가? 모델 타입이 역할을 잘 드러내는가? |
| `6 설계 원리.pdf` | 설계는 How, 아키텍처는 모듈 역할/인터페이스 정의, 결합도/응집도, 컴포넌트 | FE의 모듈은 역할과 인터페이스가 명확하며 고응집/저결합인가? |
| `6 설계 원리II.pdf` | SOLID, 인터페이스/구현 분리, DIP, REP/CCP/CRP | feature/package 배치가 변경 이유와 재사용 단위를 반영하는가? |
| `Architecture Design and Patterm.pdf` | Client-Server, Layered, Event-driven, MVC, Data-centered, Adapter, Observer 등 | 현재 FE 아키텍처 스타일과 패턴이 요구 품질에 적합한가? |

따라서 본 보고서의 순서는 코드 설명이 아니라 강의 평가 기준의 순서에 맞춘다.

---

## 1. 개요 - "What -> How" 단계의 현재 위치

`6 설계 원리.pdf` 에서 디자인은 요구분석의 **What** 이 아니라 개발자가 결정하는 **How** 의 단계로 설명된다. `2 Process.pdf` 에서도 시스템 설계는 요구분석 이후에 수행되는 architecture design 단계로 분리된다.

- 본 프로젝트는 백엔드 API 명세와 SRS 기능 그룹(FG-1~FG-10)을 기준으로 채팅, 분기, 그래프, 탐색기, 인증, 사용량, 설정 화면을 구현하고 있다.
- 코드 단계의 평가는 "요구 기능을 화면에 붙였는가?" 를 넘어서 **화면/상태/API/공통 인프라를 어떻게 모듈로 나누었고, 변경 영향이 어디까지 전파되는가?** 를 기준으로 봐야 한다.
- 현재 FE는 `app -> pages -> features -> shared` 라는 계층 구조를 가지고 있으며, 사용자 기능 단위로 `features/*` 를 나눈 구조이다.

강의 기준으로 보면 이 FE의 핵심 설계 질문은 다음과 같다.

1. 기능 요구가 적절한 feature/subsystem 으로 분해되었는가?
2. 비기능 요구(사용성, 신뢰성, 유지보수성, 변경 용이성)를 구조가 지원하는가?
3. 각 모듈은 높은 응집도와 낮은 결합도를 가지는가?
4. 컴포넌트와 hook/API 사이의 interface 가 구현 세부를 숨기는가?
5. 선택한 아키텍처 스타일과 디자인 패턴이 현재 요구에 적합한가?

이 문서는 위 질문에 따라 현재 FE 구조를 평가한다.

---

## 2. 시스템 아키텍처 (Architecture)

### 2.1 채택된 아키텍처 스타일

`Architecture Design and Patterm.pdf` 는 아키텍처를 "class 위 수준에서 grouping, role, interface 를 정의하는 것"으로 설명하고, 대표 스타일로 Client-Server, Layered, Event-driven, MVC, Pipe-and-Filter, Data-centered 등을 제시한다. 이 기준으로 보면 본 프로젝트는 다음 스타일의 조합이다.

| 스타일 | 어디서 나타나는가 |
|---|---|
| **Layered Architecture** | `app -> pages -> features -> shared` 방향의 계층. 전역 설정, 라우트 화면, 기능 모듈, 공통 인프라를 분리한다. |
| **Client-Server** | React SPA 가 클라이언트, Spring Boot BE 가 서버. REST + SSE 로 통신한다. |
| **Component-Based Architecture** | React 컴포넌트 기반. `ChatHeader`, `MessageList`, `GraphPanel`, `ConversationList` 등 UI를 컴포넌트로 구성한다. |
| **Event-driven (부분)** | SSE 스트리밍(`chunk`, `turn_completed`), Toast CustomEvent, React Query cache invalidation 이 이벤트 기반으로 동작한다. |
| **MVC/MVVM 변형** | View = React component, Model = TypeScript type/Zod schema, ViewModel 역할 = custom hook(`useMessages`, `useGraph`, `useUsage`). |
| **Data-Centered (부분)** | TanStack Query cache 가 클라이언트 측 공유 데이터 저장소처럼 동작한다. 여러 컴포넌트가 `queryKey` 로 동일 데이터를 공유한다. |

### 2.2 컴포넌트 다이어그램 (개념적)

```text
┌─────────────────────────────────────────────────────────────┐
│                       Browser / React SPA                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ app                                                 │    │
│  │  ├─ providers  (Router, Query, Auth, Toast)         │    │
│  │  ├─ router     (ProtectedRoute / PublicRoute)       │    │
│  │  └─ errors     (AppErrorBoundary)                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                  │
│  ┌───────────────────────▼─────────────────────────────┐    │
│  │ pages                                               │    │
│  │  ├─ LoginPage                                       │    │
│  │  ├─ MyPage                                          │    │
│  │  ├─ SettingsPage                                    │    │
│  │  └─ chat/ChatLayout                                 │    │
│  └───────────────────────┬─────────────────────────────┘    │
│                          │ feature hooks/components          │
│  ┌───────────────────────▼─────────────────────────────┐    │
│  │ features                                            │    │
│  │  ├─ auth                    ├─ member               │    │
│  │  ├─ chat                    ├─ usage                │    │
│  │  ├─ branch                  ├─ settings             │    │
│  │  ├─ graph                   └─ search               │    │
│  │  └─ conversation-explorer                           │    │
│  └───────────────────────┬─────────────────────────────┘    │
│                          │ shared API/UI/utils               │
│  ┌───────────────────────▼─────────────────────────────┐    │
│  │ shared                                              │    │
│  │  ├─ api       (client, sse, endpoints, errors)      │    │
│  │  ├─ components (Button, Toast, ResizeHandle)        │    │
│  │  ├─ hooks     (useResizeDrag)                       │    │
│  │  ├─ utils     (date, toastEvents)                   │    │
│  │  └─ config/constants                                │    │
│  └───────────────────────┬─────────────────────────────┘    │
│                          │ fetch / EventSource-like stream   │
└──────────────────────────┼──────────────────────────────────┘
                           │ REST + SSE (JWT)
┌──────────────────────────▼──────────────────────────────────┐
│                     AIT Backend API                         │
│  Auth / Member / Chat / Branch / Graph / Explorer / Usage   │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 모듈 vs 컴포넌트 - 본 프로젝트에서의 매핑

강의 기준:
- **모듈**: 코드 레벨의 관심사 분리 단위. 정적 구조.
- **컴포넌트**: 실행/배포 단위. 런타임 구조.

본 FE는 Netlify/Vite 빌드 산출물 기준으로는 **하나의 SPA 컴포넌트** 이다. 그러나 코드 내부에서는 `features/*` 를 논리적 모듈로 사용한다.

| 구분 | 본 프로젝트에서의 예 |
|---|---|
| 배포 컴포넌트 | Vite 로 빌드되는 단일 React SPA |
| 외부 컴포넌트 | Spring Boot Backend API, 외부 AI server(백엔드 뒤쪽) |
| 논리 모듈 | `features/chat`, `features/branch`, `features/graph`, `features/auth` 등 |
| 공통 모듈 | `shared/api`, `shared/components`, `shared/hooks`, `shared/utils` |

핵심 분리축은 **사용자 기능 단위(feature)** 이며, 공통 인프라는 `shared` 로 밀어내는 구조이다.

### 2.4 강의의 Design Work Process 로 본 FE 설계

`6 설계 원리.pdf` 의 Design Work Process 는 다음 순서를 제시한다.

1. **Set Design Goals**
2. **Decide Style**
3. **Specify Functions & Interfaces of Subsystem**
4. **Review Architectural Design**

이를 FE에 적용하면 다음과 같다.

| 강의 단계 | FE에서의 적용 | 평가 |
|---|---|---|
| Set Design Goals | 사용성 높은 채팅/분기 UX, API 변경 대응, 인증 안정성, 스트리밍 신뢰성, 유지보수성 | 목표는 기능 구현 과정에서 부분적으로 드러나지만, 문서화된 FE design goal 은 부족하다. |
| Decide Style | Layered + Client-Server + Component-Based + Event-driven 조합 | React SPA 특성에 적절하다. |
| Specify Functions & Interfaces | `features/*` 내부의 `api`, `hooks`, `components`, `types` 로 역할을 나눔 | 큰 방향은 좋으나 `ChatLayout`, `ConvSidebar` 에서 interface 경계가 흐려진다. |
| Review Architectural Design | `SUMMARY.md`, `FILE_STRUCTURE.md`, 수정제안서로 변경/명세 정합성 기록 | 사후 기록은 좋지만 정량적 coupling/cohesion review 는 아직 부족하다. |

즉, FE는 강의의 설계 프로세스 중 **스타일 선택과 기능별 분해는 잘 수행**했지만, **subsystem interface 검토와 architecture review 를 더 체계화할 필요**가 있다.

---

## 3. 모듈 분할의 근거 (Subsystem)

`4 요구 분석.pdf` 는 기능 요구/비기능 요구를 구분하고, 도메인을 sub-domain 으로 나눠 책임을 분리할 수 있다고 설명한다. 또한 DDD 관점에서는 기술 요소보다 **비즈니스 의미** 를 기준으로 구조를 나누는 것이 중요하다. 이 기준에서 FE의 `features/*` 는 다음처럼 해석된다.

| 모듈 | 분할 근거 (강의 metric 기준) |
|---|---|
| `app` | 라우터, Provider, ErrorBoundary 등 앱 전체 실행 환경. 도메인 기능과 변경 이유가 다르므로 별도 계층. |
| `pages` | 라우트 단위 조립 계층. 여러 feature 를 묶어 한 화면을 만드는 역할. |
| `shared/api` | HTTP client, SSE, endpoint, error 처리. 모든 feature 가 재사용하므로 CRP 관점에서 공통화. |
| `shared/components` | `Button`, `Toast`, `ResizeHandle` 등 기능 도메인과 무관한 UI 재사용 단위. |
| `features/auth` | 로그인/회원가입/세션 복원. 사용자 인증 흐름이 한 곳에 응집. |
| `features/member` | 마이페이지 프로필/플랜/계정 삭제 UI. 인증과 관련 있지만 "회원 정보 표시/관리" 라는 별도 변경 이유가 있음. |
| `features/chat` | 대화 생성, 메시지 조회/전송, SSE 스트리밍, 재생성/수정. FG-1 중심. |
| `features/branch` | 분기 생성/수정/삭제/복구 API 와 분기 메시지 조회. FG-2 중심. |
| `features/graph` | 분기 구조 시각화, 그래프 조회/확장. FG-3 중심. |
| `features/conversation-explorer` | 대화/분기 트리 탐색기와 사이드바. FG-4 중심. |
| `features/usage` | 토큰 사용량 조회와 warning level 처리. Phase 4 FR-5.3 중심. |
| `features/search` | 사이드바 대화/분기 검색. FG-6 일부. |
| `features/settings` | 로컬 환경 설정과 기본 LLM 모델 선택. FG-10 일부. |

분할 의도 자체는 강의의 **도메인 중심 분해 / 기능 중심 응집** 과 잘 맞는다. 다만 실제 구현에서는 일부 feature 가 다른 feature 내부 API 를 직접 많이 호출하여 경계가 흐려진다. 이는 뒤의 결합도 분석에서 다룬다.

### 3.1 기능 요구와 비기능 요구의 반영

요구분석 강의 기준으로 FE 구조를 기능 요구와 비기능 요구로 나누어 보면 다음과 같다.

| 요구 유형 | FE 구조 반영 |
|---|---|
| 기능 요구: 대화 작성 | `features/chat`, `pages/chat/ConversationView`, `ChatInput`, `MessageList` |
| 기능 요구: 분기 관리 | `features/branch`, `features/conversation-explorer`, `features/graph` |
| 기능 요구: 그래프 시각화 | `features/graph/components/GraphPanel` |
| 기능 요구: 대화 탐색 | `features/conversation-explorer`, `features/search` |
| 기능 요구: 계정/인증 | `features/auth`, `features/member` |
| 기능 요구: 사용량/설정 | `features/usage`, `features/settings` |
| 비기능 요구: 사용성 | Toast, loading skeleton, typing effect, resize panel, graph view mode |
| 비기능 요구: 신뢰성 | ErrorBoundary, ApiError, 전송 실패 시 입력 복구, SSE error 처리 |
| 비기능 요구: 유지보수성 | feature 분리, `shared/api`, mapper, Zod schema |
| 비기능 요구: 변경 용이성 | endpoint 상수화, React Query cache, API response mapper |

이 매핑은 강의의 "요구는 설계의 기초가 되어야 한다"는 기준에 부합한다. 다만 일부 비기능 요구는 구조보다 개별 컴포넌트 구현에 흩어져 있어 설계 문서 차원의 traceability 는 약하다.

---

## 4. 결합도 (Coupling) 분석

### 4.1 결합도 종류와 본 프로젝트의 위치

`6 설계 원리.pdf` 의 결합도 단계는 다음 순서로 약한 결합에서 강한 결합으로 올라간다.

```text
Data Coupling < Stamp Coupling < Control Coupling < Common Coupling < Content Coupling
```

프론트엔드에서는 클래스보다 **컴포넌트, hook, API module, cache, localStorage** 사이의 의존으로 해석해야 한다. 이 기준으로 보면:

- **대부분의 UI -> hook -> API 호출은 Data Coupling**: 컴포넌트는 hook 에 props/인자만 전달하고 데이터를 받는다. 예: `useUsage`, `useGraph`, `useMessages`. 양호.
- **Stamp Coupling 일부 존재**: `ChatLayout` 이 `Conversation`, `Branch`, `GraphResponse`, `Message` 등 여러 모델을 한꺼번에 조립한다. 필요한 필드보다 큰 객체를 넘기는 흐름이 많다.
- **Control Coupling 위험**: `ChatLayout` 이 활성 분기 여부, parent message prefix, branch marker label, turnId search param 제거 등 여러 하위 컴포넌트 동작 흐름을 결정한다.
- **Common Coupling 일부 존재**: React Query cache(`['graph']`, `['conversations']`, `['usage']`)와 `localStorage` 가 공유 상태로 사용된다. 의도된 공유 저장소지만 변경 규칙이 흩어지면 결합도가 올라간다.
- **Content Coupling 은 거의 없음**: 다른 모듈의 내부 변수를 직접 건드리는 식의 결합은 발견되지 않는다.

### 4.2 모듈 간 의존 그래프 (의심 영역)

| 의존 | 평가 |
|---|---|
| `pages/chat/ChatLayout` -> `auth/chat/branch/graph/conversation-explorer/settings/shared` | 여러 feature 를 한 파일에서 조립. page 계층의 역할이지만 책임이 과도하다. |
| `conversation-explorer/ConvSidebar` -> `graph`, `branch`, `chat` | 탐색기 feature 가 그래프 조회, 메시지 조회, 분기 복구, 삭제까지 직접 처리. feature 경계가 흐림. |
| `conversation-explorer/ConversationList` -> `branchApi` | ~~UI row 컴포넌트가 API mutation 과 cache invalidation 을 직접 수행~~. **✅ #3 적용으로 해소** — `useUpdateBranch`/`useDeleteBranch` hook 으로 분리. |
| `usage/api/schemas` -> `graph/api/schemas.apiEnvelope` | ~~공통 API envelope 이 특정 feature 인 `graph` 안에 있음~~. **✅ #4 적용으로 해소** — `shared/api/schemas` 로 이동. |
| `conversation-explorer/api/schemas` -> `branch/api/schemas.TitleStatusSchema` | ~~title status 가 다른 feature schema 에 의존~~. **✅ #4 적용으로 해소** — `shared/api/schemas` 로 이동. |
| `chat/api/messageStream` + `shared/api/sse` | ~~SSE parsing 로직이 중복~~. **✅ #5 적용으로 해소** — `shared/api/sse` 가 파서/스트림(`parseSseBlock`·`parseSseStream`)을 담당, `messageStream` 은 event 매핑만 담당. |
| `settings` -> `chat/constants/llm` | 설정이 기본 LLM 모델 선택을 위해 chat 상수를 참조한다. 의미상 LLM 설정은 shared 또는 llm feature 후보. |

### 4.3 CBO / Ca / Ce 추정 (강의 metric)

대표 파일 기준으로 거칠게 보면:

| 파일/모듈 | Ce (사용함) | Ca (사용됨) | 평가 |
|---|---:|---:|---|
| `ChatLayout.tsx` | 매우 높음 | 1 route | **Ce 과다**. 데이터/상태 coordinator 책임이 비대. |
| `ConvSidebar.tsx` | 높음 | 1 page | 탐색기, 그래프, branch, chat 로직 혼합. |
| `GraphPanel.tsx` | 중~높음 | 1 sidebar | 시각화 책임은 명확하지만 1000줄 이상으로 내부 복잡도 과다. |
| `apiClient` | 낮음 | many | 안정 모듈. 공통 HTTP facade 로 적절. |
| `apiEnvelope` | 낮음 | many | 안정 모듈. **✅ #4 적용으로 `shared/api/schemas` 로 이동** (기존엔 `graph` feature 에 위치). |
| `useUsage` | 낮음 | 2~3 | 기능 단위 hook 으로 양호. |

가장 큰 refactoring 대상은 `ChatLayout`, `ConvSidebar`, `GraphPanel` 이다 (`ConversationList.BranchRow` 는 #3 적용으로 해소).

---

## 5. 응집도 (Cohesion) 분석

`6 설계 원리.pdf` 와 `6 설계 원리II.pdf` 는 응집도를 "한 모듈 안의 작업들이 서로 얼마나 관련 있는가"로 설명한다. 단계는 다음 순서로 약한 응집에서 강한 응집으로 올라간다.

```text
Coincidental < Logical < Temporal < Procedural < Communicational < Sequential < Functional
```

프론트엔드에서 바람직한 형태는 "한 feature/hook/component 가 하나의 사용자 기능 또는 하나의 UI 책임에 집중하는 Functional Cohesion" 이다.

| 모듈 | 응집 유형 | 근거 |
|---|---|---|
| `features/usage` | **Functional** | 사용량 조회/표시라는 단일 목적. |
| `features/auth` | **Functional** | 로그인/회원가입/세션 복원에 집중. |
| `features/settings` | **Functional** | 로컬 설정 읽기/쓰기와 설정 UI. 단 LLM 상수 위치는 개선 여지. |
| `shared/api/client` | **Functional** | HTTP 요청, 인증 헤더, 에러 파싱이라는 공통 API 목적. |
| `features/chat` | **Communicational + Functional 혼합** | 메시지라는 데이터 중심으로 API, stream, UI, hook 이 묶임. feature 단위로는 자연스럽지만 내부 책임이 많음. |
| `features/graph` | **Functional 이지만 크기 과다** | 그래프 조회/확장/표시는 목적이 명확하나 `GraphPanel` 이 레이아웃 계산, SVG 렌더링, interaction 을 모두 포함. |
| `features/conversation-explorer` | **Communicational + Procedural 혼합** | 대화 목록, 검색, 그래프 패널 조립, 분기 삭제/복구까지 포함하여 탐색기 목적을 넘어섬. |
| `pages/chat/ChatLayout` | **Procedural** | 여러 hook 호출과 상태 조립을 순서대로 처리하는 orchestration 파일. SRP 위반 가능성이 큼. |

> 가장 큰 문제: `ChatLayout` 과 `ConvSidebar` 가 기능 사이의 흐름을 한 파일에서 절차적으로 조립한다. 강의가 말한 Functional Cohesion 에 비해 낮은 응집 형태이다.

---

## 6. SOLID 적용 현황

### 6.1 SRP - Single Responsibility Principle

| 대상 | 평가 |
|---|---|
| `useUsage`, `usageApi`, `UsageMeter` | 양호. 조회/API/UI 역할이 비교적 분리됨. |
| `apiClient` | 양호. HTTP 요청 공통화에 집중. |
| `AuthProvider` | 대체로 양호. 인증 상태와 세션 저장을 담당. 단 `memberApi.getMe/deleteMe` 까지 포함되어 auth/member 경계가 약간 겹침. |
| `ChatLayout` | 위반 가능성 큼. 채팅 화면 조립, 메시지 병합, 분기 prefix 계산, 그래프 라벨 계산, 라우팅, 전송 실패 복구 등 책임이 많다. |
| `ConvSidebar` | 위반 가능성 큼. 탐색기 UI + 그래프 조회/병합 + 복구/확장 + 삭제 + resize 를 담당한다. |
| `ConversationList.BranchRow` | ~~위반. row 렌더링과 API mutation/cache invalidation 을 동시에 수행~~. **✅ #3 적용으로 해소** — mutation 은 `useUpdateBranch`/`useDeleteBranch` hook 으로 분리, row 는 presentation 에 집중. |
| `GraphPanel` | 위반 가능성. 그래프 데이터 변환, layout, SVG 렌더링, zoom/view mode interaction 이 한 파일에 집중. |

### 6.2 OCP - Open/Closed Principle

- 양호: API 응답은 Zod schema 와 mapper 를 통해 확장 가능하다. 예를 들어 Phase 4 탐색기 응답은 `explorerMappers` 에서 UI 모델로 변환한다.
- 양호: `LLM_OPTIONS` 를 통해 모델 목록 확장이 비교적 쉽다.
- 주의: SSE 이벤트 종류가 늘어나면 `messageStream.ts`, `useRegenerate.ts`, `useEditMessage.ts` 의 switch/handler 를 직접 수정해야 한다.
- 주의: `GraphPanel` 의 view mode 가 늘어나면 같은 파일의 layout/render branch 가 계속 커질 가능성이 높다.

### 6.3 LSP - Liskov Substitution

프론트엔드는 클래스 상속보다 타입/컴포넌트 조합이 많아 LSP 위반 사례는 두드러지지 않는다. 다만 컴포넌트 props 타입이 계약 역할을 하므로, `Message`, `Conversation`, `Branch` 모델의 의미가 일관되어야 한다.

주의할 점:
- 탐색기 API 에서 `forkAtTurnIndex` 를 모를 때 `0` 으로 채우는 임시 모델은 `Branch` 계약을 약하게 만든다.
- `Conversation.branches` 는 Phase 4 이후 제거 후보인데 여전히 여러 곳에서 사용되어 모델 의미가 흔들린다.

### 6.4 ISP - Interface Segregation

- 컴포넌트 props 는 대체로 필요한 값만 받지만, 일부 컨테이너 컴포넌트는 props 와 handler 가 많다.
- `ConvSidebar` 는 `conversations`, `messages`, `conv`, `graphRootId`, `optimisticBranch` 를 모두 받아 내부에서 다시 API 조회까지 한다. 소비자에게 넓은 계약을 요구하는 편이다.
- `GraphPanel` 역시 `messages`, `conv`, `branchMessagesById`, `graphData`, `onExpand`, `onRestore`, `zoom`, `viewMode` 등 많은 역할의 props 를 받는다.

### 6.5 DIP - Dependency Inversion

- 양호: 화면 컴포넌트가 대부분 `fetch` 를 직접 호출하지 않고 API module/hook 을 통해 의존한다.
- 양호: `apiClient` 와 `streamSSE` 가 저수준 HTTP/SSE 구현을 숨긴다.
- 주의: feature 간 의존이 interface 가 아니라 concrete module import 이다. 예: `conversation-explorer` 가 `branchApi`, `graphApi`, `useMessages` 를 직접 import 한다.
- 주의: 공통 abstraction 인 `apiEnvelope` 가 `graph` feature 안에 있어 high-level feature 가 다른 feature 의 low-level 구현에 의존하는 모양이 된다.

---

## 7. 디자인 패턴 적용 현황

`Architecture Design and Patterm.pdf` 는 아키텍처 스타일과 디자인 패턴을 구분한다. 아키텍처 스타일은 시스템 전체의 컴포넌트 종류와 통신 방식을 정하고, 디자인 패턴은 아키텍처보다 낮은 수준에서 반복되는 설계 문제를 해결한다. 이 기준에서 FE에 나타나는 패턴은 다음과 같다.

| 패턴 | 적용 위치 |
|---|---|
| **Facade** | `apiClient`, `chatApi`, `graphApi`, `explorerApi`, `usageApi`. HTTP endpoint, header, response parsing 을 단순 함수로 감싼다. |
| **Adapter / Mapper** | `chatMappers`, `explorerMappers`. 백엔드 DTO 를 FE UI 모델로 변환한다. 특히 explorer API -> `Conversation[]` 변환이 대표적이다. |
| **Observer / Event-driven** | Toast CustomEvent, SSE stream, React Query invalidation. 상태 변화에 따라 구독자가 갱신된다. |
| **Provider** | `AppProviders`, `AuthProvider`, `QueryProvider`, `ToastProvider`. 전역 상태/서비스를 React tree 에 제공한다. |
| **Guard** | `ProtectedRoute`, `PublicRoute`. route 접근을 인증 상태에 따라 제한한다. |
| **Strategy (부분)** | LLM provider/model 선택. `LLM_OPTIONS` 와 설정값에 따라 새 대화 생성 옵션이 바뀐다. |
| **Composite (부분)** | 대화/분기 트리(`ConversationList`)와 그래프 노드 구조(`GraphPanel`). 부모-자식 관계를 UI 트리로 렌더링한다. |
| **Repository/Data Access (부분)** | TanStack Query cache 와 API hook 이 클라이언트 데이터 접근 계층처럼 동작한다. |

명시적으로 패턴 클래스를 둔 것은 아니지만, React 생태계의 Provider/hook/API module 구조가 위 패턴들의 역할을 수행한다.

### 7.1 아키텍처 스타일과 디자인 패턴의 구분

강의 기준으로 `Layered`, `Client-Server`, `Event-driven` 은 **아키텍처 스타일** 이고, `Adapter`, `Facade`, `Observer` 는 **디자인 패턴** 이다. 따라서 이 FE를 설명할 때 다음처럼 구분해야 한다.

| 구분 | 이 프로젝트의 설명 |
|---|---|
| 아키텍처 스타일 | React SPA 클라이언트가 `app -> pages -> features -> shared` 계층 구조를 가지며 BE와 REST/SSE 로 통신한다. |
| 디자인 패턴 | API facade, DTO mapper adapter, Toast/SSE observer-like event flow, Provider 기반 전역 context. |

이 구분을 명확히 해야 "아키텍처 설계"와 "디자인 패턴 적용"을 혼동하지 않는다.

---

## 8. 디자인 원리 - Abstraction / Encapsulation / Information Hiding

### 8.1 Abstraction

- TypeScript type 과 Zod schema 로 서버 응답의 추상 모델을 정의한다.
- `apiClient.get/post/patch/delete` 는 fetch 세부 구현을 추상화한다.
- `useMessages`, `useGraph`, `useUsage`, `useConversations` 는 데이터 조회/캐시/폴링을 추상화한다.
- `LLM_OPTIONS` 는 provider/model 조합을 UI 선택지로 추상화한다.

### 8.2 Encapsulation / Information Hiding

양호한 점:
- 컴포넌트는 대체로 API endpoint 문자열을 모르고 API module 을 사용한다.
- 탐색기 API 응답은 mapper 에서 UI 모델로 바뀌므로 UI 는 서버 DTO 세부 구조를 덜 안다.
- Error 처리와 token header 부착은 `shared/api` 로 숨겨져 있다.

주의할 점:
- `localStorage` 접근이 `authStorage`, `settingsStorage`, `client`, `sse`, `authInterceptor` 등에 흩어져 있다. 저장소 접근 abstraction 이 완전히 하나로 묶이지 않았다.
- `MessageList` 는 `querySelectorAll([data-turn-id])` 로 DOM 을 직접 찾는다. React state/refs 기반 추상화보다 구현 세부에 의존한다.
- `GraphPanel` 은 내부 layout 계산이 큰 파일 안에 있어 알고리즘 구현이 UI 렌더링과 강하게 결합되어 있다.

### 8.3 Interface Separation

- UI 컴포넌트와 API hook 의 분리는 좋은 방향이다.
- 다만 mutation hook 이 없는 기능에서는 UI 컴포넌트가 API 를 직접 호출한다. 이 경우 interface separation 이 깨진다. (분기 rename/delete 는 **✅ #3 적용으로 `useUpdateBranch`/`useDeleteBranch` hook 화**.)
- `apiEnvelope`, 공통 status/page schema 는 **✅ #4 적용으로 `shared/api/schemas` 로 이동**해 진짜 공통 interface 가 되었다. feature 단독 enum 은 각 feature 에 유지.

---

## 9. 패키지 설계 원칙 (REP / CCP / CRP)

강의의 3원칙:

| 원칙 | 본 프로젝트 |
|---|---|
| **REP** (Reuse/Release Equivalence) | FE 는 단일 SPA 로 함께 릴리즈된다. feature 별 독립 배포는 아니지만 논리적 재사용 단위는 `features/*` 이다. |
| **CCP** (Common Closure) | `features/chat`, `features/graph`, `features/usage` 처럼 같은 이유로 변하는 파일을 묶으려는 구조는 양호하다. |
| **CRP** (Common Reuse) | `shared/api`, `shared/components`, `shared/hooks` 는 여러 feature 가 함께 재사용하는 것만 모으려는 방향이다. |

주의:
- `apiEnvelope` 는 모든 feature 가 재사용하므로 `shared/api/schemas` 로 이동했다. **✅ #4 적용** (기존엔 `graph` 에 위치 — CCP/CRP 정합성 회복).
- `TitleStatusSchema` 는 `branch`, `graph`, `conversation-explorer` 가 함께 쓰므로 `shared/api/schemas` 로 이동했다. **✅ #4 적용** (`SummaryStatusSchema` 도 함께 이동).
- `member/components/UsageMeter` 가 `usage` feature hook 을 직접 사용한다. 실제 기능 경계는 "member page 에서 usage 를 보여준다" 이므로 page 조립 계층에서 데이터를 내려주는 방식도 고려할 수 있다.
- re-export shim(`auth/api/memberApi`, `branch/hooks/useChatTitle`, `src/mocks`)은 마이그레이션 호환에는 좋지만 장기적으로 package boundary 를 흐린다.

---

## 10. 품질 속성 평가

`1 개요.pdf` 는 좋은 소프트웨어의 품질로 maintainability, reusability, reliability, usability, performance 등을 제시한다. `2 Process.pdf` 의 좋은 프로세스 특성도 predictability, testing/maintenance 용이성, change 용이성, defect removal 용이성을 강조한다. 이를 FE 관점으로 해석하면 다음과 같다.

| 품질 | 현황 |
|---|---|
| **Reliability** | ErrorBoundary, Toast, ApiError, 전송 실패 입력 복구 등 사용자 보호 장치가 있다. SSE 중단/에러 처리도 구현되어 있다. |
| **Performance Efficiency** | React Query cache, pagination, graph window expand, resize UI 가 있다. 단 `GraphPanel` 대형 계산이 커질 경우 성능 최적화 여지가 있다. |
| **Maintainability** | feature 분리와 문서화는 양호. 단 `ChatLayout`, `ConvSidebar`, `GraphPanel` 비대로 유지보수 비용이 올라간다. |
| **Portability** | Vite/React 기반 SPA 로 배포가 단순하다. API base URL 은 env 로 분리되어 있다. |
| **Security** | JWT token 을 Authorization header 로 붙인다. 단 token 이 localStorage 에 저장되므로 XSS 방어는 별도 주의가 필요하다. |
| **Compatibility** | REST + SSE 표준 사용. Zod 로 응답 검증을 한다. |
| **Usability** | 토스트, 로딩 skeleton, 그래프/탐색 UI, 타이핑 효과 등 사용자 경험 요소가 있다. |
| **Developer Usability** | `FILE_STRUCTURE.md`, `SUMMARY.md` 로 구조와 변경 이력을 남긴다. 단 컬러 토큰 의미 반전은 신규 개발자에게 혼란을 줄 수 있다. |

### 10.1 강의 품질 기준으로 본 핵심 판단

| 강의 품질 기준 | FE 판단 |
|---|---|
| Maintainability | 구조 문서와 feature 분리는 좋지만 대형 coordinator 파일이 유지보수성을 낮춘다. |
| Reusability | `shared/components`, `shared/api`, `shared/hooks` 는 재사용성이 높다. 반면 `GraphPanel` 내부 로직은 재사용하기 어렵다. |
| Reliability | ErrorBoundary/API error/SSE error 처리로 기본 신뢰성은 갖췄다. |
| Usability | 채팅 입력 복구, 타이핑 표시, 그래프/탐색 UI 등 사용자 흐름을 고려했다. |
| Verifiability/Testability | 순수 mapper/hook 은 테스트 가능하지만 `ChatLayout`, `ConvSidebar`, `GraphPanel` 은 테스트하기 어렵다. |
| Ease of Change | API endpoint/schema/mapper 기반 변경 흡수는 좋지만 feature 간 concrete import 가 변경 전파를 키운다. |

---

## 11. 부족한 점 / 개선 제안 / Refactoring 후보

강의 metric 기준 우선순위. 1~5 는 구조 개선 효과가 크고, 6 이후는 점진 개선 후보이다.

> **진행 현황 (2026-06-03):** Refactoring **#3·#4·#5 는 적용 완료**(안전 리팩토링 — 동작/문구/API contract 변경 없음, `npm run lint`·`npm run build` 통과). #1·#2·#7(대형 컴포넌트 분해)은 위험도가 높아, #6(`restoreBranch` 명세 정합성)은 BE 명세 확인이 필요해 **후속 과제**로 남겨 두었다. 각 항목의 상태는 아래 블록 인용으로 표기한다.

### Refactoring #1 - `ChatLayout` 분해 (SRP, Cohesion)

> **상태: ⏸ 후속 과제** (대형 컴포넌트 분해, 위험도 높음 — 이번 범위에서 제외).

**문제**: `ChatLayout.tsx` 가 400줄 이상이며, route state, message state, live stream merge, branch prefix, graph label, send/regenerate/edit handler 를 모두 처리한다.

**제안 분해**:

```text
ChatLayout
  ├─ useChatRouteState          ← activeConvId, targetTurnId, navigation
  ├─ useActiveConversation      ← conversations + chatMeta fallback
  ├─ useBranchContext           ← activeBranch, parentMessages, branch marker
  ├─ useLiveMessageMerge        ← history + send/regenerate/edit live message merge
  └─ ChatMainPanel              ← NewChatLanding / ConversationView 선택
```

효과:
- `ChatLayout` 은 화면 frame 조립만 담당.
- branch 계산과 message merge 로직을 독립 테스트 가능.
- 변경 영향이 hook 단위로 좁아진다.

### Refactoring #2 - `ConvSidebar` 를 탐색기와 그래프 컨테이너로 분리

> **상태: ⏸ 후속 과제** (대형 컴포넌트 분해, 위험도 높음 — 이번 범위에서 제외).

**문제**: `ConvSidebar` 가 conversation list, graph data merge, graph expand, restore, delete, resize, navigation 을 모두 담당한다.

**제안 분해**:

```text
ConvSidebar
  ├─ ConversationExplorerPanel  ← 목록/검색/선택/삭제
  ├─ GraphSidebarPanel          ← useGraph, expand, restore, zoom/view mode
  └─ useOptimisticGraphMerge    ← optimisticBranch + graph snapshot merge
```

효과:
- `conversation-explorer` 와 `graph` 의 feature 경계를 회복.
- 그래프 복구/확장 로직을 graph feature 로 이동 가능.

### Refactoring #3 - Branch mutation hook 신설

> **상태: ✅ 적용 완료 (2026-06-03).** `features/branch/hooks/useUpdateBranch.ts`, `features/branch/hooks/useDeleteBranch.ts` 를 신설하고 `BranchRow` 는 이 hook 만 호출하도록 변경했다. API 호출과 `['conversations']` cache invalidation 을 hook 으로 모았으며, 실패 시 제목 rollback·confirming 상태 해제 등 기존 UX 는 컴포넌트에 그대로 유지했다(토스트 등 신규 동작 추가 없음).

**문제**: `ConversationList.BranchRow` 가 `branchApi.updateBranch/deleteBranch` 와 `queryClient.invalidateQueries` 를 직접 호출한다.

**제안**:

```text
features/branch/hooks/useUpdateBranch.ts
features/branch/hooks/useDeleteBranch.ts
```

또는 UI 단에서는 `onRenameBranch`, `onDeleteBranch` handler 만 props 로 받도록 한다.

효과:
- UI 컴포넌트는 presentation 에 집중.
- mutation 성공/실패/toast/cache invalidation 정책을 한 곳에 모을 수 있다.

### Refactoring #4 - 공통 API schema 를 `shared/api` 로 이동

> **상태: ✅ 적용 완료 (2026-06-03).** `shared/api/schemas.ts` 를 신설하고 `apiEnvelope`, `pageResponseSchema`, `TitleStatusSchema`, `SummaryStatusSchema` 를 이곳으로 통합했다. graph/branch/chat 의 중복 `apiEnvelope` 정의와 feature 간 schema 의존(graph→branch, conversation-explorer→branch/graph, usage→graph)을 제거하고 모든 import 경로를 `shared/api/schemas` 로 갱신했다(zod 검증 동작 동일). 단, 각 feature 단독으로만 쓰이는 enum(`MessageStatusSchema`/`SenderTypeSchema`/`LlmProviderSchema`/`LlmModelSchema`/`WarningLevelSchema`)은 단일 사용처라 해당 feature 에 그대로 둔다.

**문제**: `apiEnvelope` 가 `graph/api/schemas.ts` 와 `chat/api/schemas.ts`, `branch/api/schemas.ts` 등에 중복되거나 특정 feature 에 존재한다.

**제안**:

```text
shared/api/schemas.ts
  ├─ apiEnvelope
  ├─ pageResponseSchema
  ├─ TitleStatusSchema
  ├─ SummaryStatusSchema
  └─ common enum schemas
```

효과:
- high-level feature 가 다른 feature 내부 schema 에 의존하지 않는다.
- API 응답 표준 변경 시 수정 지점이 하나로 줄어든다.

### Refactoring #5 - SSE 처리 통합

> **상태: ✅ 적용 완료 (2026-06-03).** `shared/api/sse.ts` 가 공통 파서 `parseSseBlock` 와 스트림 제너레이터 `parseSseStream` 를 담당하고 `streamSSE` 가 이를 재사용하도록 정리했다. `messageStream.ts` 는 중복 `parseSseBlock`·버퍼 루프를 제거하고 `parseSseStream` 을 소비하며 chat 전용 event 매핑(`turn_started`/`chunk`/`turn_completed`/`cancelled`/`error`/`done`)만 담당한다. send/regenerate/edit 의 이벤트 처리 결과는 동일하다.

**문제**: `shared/api/sse.ts` 와 `features/chat/api/messageStream.ts` 에 `parseSseBlock` 가 중복된다.

**제안**:
- `shared/api/sse.ts` 에 parser, stream, event dispatch helper 를 통합.
- `messageStream.ts` 는 chat 전용 event mapping 만 담당.

효과:
- SSE 포맷 변경 또는 error event 처리 변경 시 수정 누락 위험이 줄어든다.
- send/regenerate/edit 스트림 처리 정책을 통일할 수 있다.

### Refactoring #6 - 비명세 API `restoreBranch` 정리

> **상태: ⏸ 후속 과제.** BE 명세 확인이 필요하므로 이번 리팩토링에서 `branchApi.restoreBranch`/`ENDPOINTS.branch.restore`/`GraphPanel` restore action 을 **제거하지 않았다**. 명세 확정 후 유지/제거를 결정한다.

**문제**: `POST /chats/{id}/restore` 가 FE 코드에 있으나 현재 명세에는 없다.

**선택**:
- BE 가 구현 예정이면 명세에 endpoint/response 를 추가하고 FE 타입을 확정.
- 구현 계획이 없으면 `ENDPOINTS.branch.restore`, `branchApi.restoreBranch`, `GraphPanel` 의 restore action 을 제거 또는 숨김.

효과:
- API contract 와 구현 정합성 회복.
- 명세 기반 설계 원칙을 만족.

### Refactoring #7 - `GraphPanel` 분해

> **상태: ⏸ 후속 과제** (대형 컴포넌트 분해, 위험도 높음 — 이번 범위에서 제외).

**문제**: 1000줄 이상이며 graph build, layout, edge 보정, focused/structure view, SVG render, interaction 이 섞여 있다.

**제안 분해**:

```text
GraphPanel
  ├─ graphBuilders.ts       ← API/legacy data -> GraphNode/Edge
  ├─ graphLayout.ts         ← focused/structure layout 계산
  ├─ graphRendering.tsx     ← Node/Edge/SummaryCard 렌더링
  ├─ useGraphViewport.ts    ← zoom/scroll/viewBox 보조
  └─ GraphPanel.tsx         ← 조립
```

효과:
- layout algorithm 과 UI render 의 결합 감소.
- view mode 추가 시 OCP 에 더 가까워짐.

### Refactoring #8 - 디자인 토큰 이름과 실제 의미 정렬

**문제**: `bg-slate-950` 이 밝은 크림, `text-cyan-*` 이 카멜 계열로 재매핑되어 class name 과 실제 색 의미가 다르다.

**제안**:
- CSS custom property 이름을 semantic token 으로 변경: `--color-surface`, `--color-text`, `--color-accent`.
- Tailwind class 를 직접 의미 반전시키는 방식보다 semantic utility class 를 사용.

효과:
- 신규 개발자의 색상 선택 오류 감소.
- 디자인 시스템의 정보 은닉 향상.

### Refactoring #9 - re-export shim 정리

**문제**: 이동된 파일의 호환 shim 이 남아 있어 import 경로가 여러 개 존재한다.

**제안**:
- 실제 사용처가 모두 새 경로로 바뀐 뒤 shim 삭제.
- `rg` 로 old path import 가 0개인지 확인 후 제거.

효과:
- 모듈 경계 명확화.
- 유지보수자가 "정식 위치" 를 헷갈리지 않는다.

### Refactoring #10 - localStorage 접근 경계 통합

**문제**: auth, settings, api client, sse, authInterceptor 에서 localStorage 를 직접 읽거나 쓴다.

**제안**:

```text
shared/storage/
  ├─ tokenStorage.ts
  ├─ userStorage.ts
  └─ settingsStorage.ts
```

또는 기존 `authStorage`, `settingsStorage` 는 유지하되 `apiClient` 와 `sse` 는 token getter 를 주입받거나 shared storage helper 를 사용.

효과:
- storage 정책 변경(sessionStorage/httpOnly cookie 등) 시 영향 범위 축소.
- 보안 정책 변경에 유리.

---

## 12. 아키텍처 평가 시나리오 (SAAM/ATAM 관점)

`Architecture Design and Patterm.pdf` 는 아키텍처 평가를 "선택한 구조가 기능 요구와 비기능 품질 요구를 만족하는지 판단하는 과정"으로 설명하고, SAAM/ATAM 같은 시나리오 기반 평가를 언급한다. FE에 적용할 수 있는 시나리오는 다음과 같다.

| 시나리오 | 현재 구조의 반응 | 평가 |
|---|---|---|
| BE 탐색기 API 응답 구조가 다시 바뀐다 | `explorerApi`, Zod schema, `explorerMappers` 를 수정하면 UI 영향이 줄어든다. | Adapter/Mapper 설계가 효과적이다. |
| 새 LLM provider/model 이 추가된다 | `LLM_OPTIONS`, 관련 schema/type, 설정 선택지를 수정해야 한다. | 중간. LLM 관련 상수가 chat feature 에 있어 경계 개선 여지. |
| SSE 이벤트에 `tool_call` 같은 새 event 가 추가된다 | `streamTypes`, `messageStream`, `useRegenerate`, `useEditMessage` 등의 switch 수정 필요. | OCP 약함. event handler registry 형태가 유리. |
| 그래프 view mode 가 하나 더 추가된다 | `GraphPanel` 내부 layout/render branch 가 더 커진다. | 대형 컴포넌트 구조가 확장성 리스크. |
| token 저장 정책을 localStorage 에서 cookie/sessionStorage 로 바꾼다 | `authStorage`, `client`, `sse`, `authInterceptor` 등 여러 파일 수정 필요. | Information hiding 부족. storage abstraction 필요. |
| 대화/분기 삭제 정책이 soft delete/restore 포함으로 바뀐다 | `branchApi.restoreBranch` 명세 불일치 때문에 FE/BE contract 재검토 필요. | API 명세 정합성 리스크. |

이 시나리오 평가를 기준으로 보면 현재 구조의 강점은 **API 응답 변화 흡수**이고, 약점은 **대형 UI coordinator 와 흩어진 cross-cutting concern** 이다.

---

## 13. 잘 된 점 (Strength) - 그대로 유지할 것

- `app -> pages -> features -> shared` 계층 방향이 문서화되어 있다.
- 기능별 feature 분리는 요구 기능(FG)과 대체로 잘 대응한다.
- `apiClient`, endpoint 상수, ApiError, error code mapping 으로 API 인프라를 공통화했다.
- Zod schema 로 서버 응답 구조를 런타임 검증한다.
- React Query 를 통해 cache, staleTime, polling, invalidation 을 일관되게 관리한다.
- Phase 4 explorer 전환 시 mapper 를 두어 서버 DTO 변화가 UI 전체로 퍼지는 것을 줄였다.
- SSE streaming, typing effect, cancel, regenerate/edit 등 비동기 UX 처리가 구현되어 있다.
- ErrorBoundary, Toast, 입력 복구 등 사용자 실패 경험을 줄이는 장치가 있다.
- `SUMMARY.md`, `FILE_STRUCTURE.md` 로 구조와 변경 이력을 추적한다.

---

## 14. 정리 - 강의 metric 기준 종합 평가

| 항목 | 평가 | 핵심 근거 |
|---|---|---|
| 추상화 | B+ | API client/hook/mapper/Zod 는 양호. DOM/localStorage 직접 접근 일부 존재. |
| 모듈화 | B | feature 구조는 좋지만 `ChatLayout`, `ConvSidebar`, `GraphPanel` 이 비대. |
| Information Hiding | B | API 세부 구현은 숨김. 공통 schema 위치와 storage 접근은 개선 필요. |
| Interface Separation | B- | hook/API 경계는 양호. 일부 컴포넌트 props/API 직접 호출은 넓은 interface. |
| Coupling | B- | 계층 의도는 좋지만 feature 간 concrete import 가 많다. |
| Cohesion | B- | usage/auth/settings 는 높음. chat/explorer/graph 조립부는 낮음. |
| SRP | C+ | `ChatLayout`, `ConvSidebar`, `GraphPanel`, `BranchRow` 가 주요 위반 후보. |
| OCP | B | mapper/schema 기반 확장은 좋지만 SSE/GraphPanel 확장은 직접 수정 필요. |
| LSP | A- | 상속 구조가 적어 위반 없음. 단 임시 모델 계약은 주의. |
| ISP | B- | 컴포넌트 props/hook 계약 일부 과대. |
| DIP | B | API facade 는 좋음. feature 간 concrete dependency 는 개선 필요. |
| 아키텍처 적합성 | B+ | Layered + Client-Server + Component + Event-driven 조합은 FE 요구에 적절. |

**한 줄 요약**: 현재 FE는 기능 중심 계층 구조와 공통 API 인프라를 갖춘 좋은 출발점이다. 다만 prototype 단계에서 빠르게 기능을 붙이면서 `ChatLayout`, `ConvSidebar`, `GraphPanel` 에 orchestration 과 UI/데이터 책임이 집중되었다. **Refactoring #3~#5 는 2026-06-03 안전 리팩토링으로 적용 완료**(BranchRow mutation hook 분리, 공통 schema `shared/api/schemas` 통합, SSE 파서/스트림 통합)했고, 남은 #1·#2·#7(대형 컴포넌트 분해)까지 적용하면 강의 metric 기준으로 고응집·저결합 구조에 훨씬 가까워진다.

---

## 참고: 강의 슬라이드와의 매핑 (자체 점검 체크리스트)

- [x] What vs How 단계 인식
- [x] Subsystem = feature/package 매핑
- [x] Module / Component / Runtime 관점 구분
- [x] Design Goal & Style 결정 (Layered + Client-Server + Component + Event-driven)
- [x] 품질 속성 점검
- [x] 결합도 단계 진단
- [x] 응집도 단계 진단
- [x] SOLID 5원칙 진단
- [x] REP / CCP / CRP 진단
- [x] 적용된 디자인 패턴 식별
- [x] 미적용/잠재 패턴 식별
- [x] Architecture Evaluation 관점의 시나리오 정리
