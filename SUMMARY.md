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

## 2026-06-03 — Codex (FE 안전 리팩토링 #6·#8·#9·#10)

**유형:** refactor
**범위:** shared/storage, shared/api, features/branch, features/graph, features/conversation-explorer, styles, docs

### 변경 내용
- **Refactoring #6 (비명세 restore 정리):** BE 명세/구현에 없는 `POST /chats/{id}/restore` 호출 경로 제거.
  - `ENDPOINTS.branch.restore`, `branchApi.restoreBranch`, `useOptimisticGraphMerge.handleRestore`, `GraphPanel.onRestore` props/click action 삭제.
  - 삭제된 graph node 는 계속 표시하되 보조 문구를 `복구`에서 `삭제됨`으로 변경.
- **Refactoring #8 (semantic color token):** `--color-surface`, `--color-text`, `--color-line`, `--color-accent` 계열 token 및 Tailwind `ui-*` theme 색 추가.
  - 앱 코드의 `bg-slate-*`/`text-cyan-*`/`border-slate-*` 직접 사용을 `bg-ui-surface`, `text-ui-text-*`, `border-ui-line`, `bg-ui-accent-*` 등으로 교체.
- **Refactoring #9 (shim 정리):** 사용처 없는 compatibility shim 삭제.
  - 삭제: `src/mocks/messages.ts`, `src/mocks/conversations.ts`, `src/app/providers/toastEvents.ts`, `src/features/auth/api/memberApi.ts`, `src/features/branch/hooks/useChatTitle.ts`.
- **Refactoring #10 (storage 경계 통합):** `shared/storage/localStorage.ts`, `tokenStorage.ts`, `userStorage.ts`, `settingsStorage.ts` 신설.
  - auth/settings/API client/SSE/messageStream/authInterceptor 의 직접 `localStorage` 접근을 shared storage helper 사용으로 변경.
- `FE_ARCHITECTURE_REPORT.md` §4·§6·§8·§9·§10·§11·§12·§14 에 #6·#8·#9·#10 적용 결과 반영.

### 영향 범위
- 비명세 복구 버튼/호출만 제거. 삭제된 분기 시각화, 그래프 확장, 채팅/분기 생성·수정·삭제, SSE 스트리밍 계약은 유지.
- 기존 `slate/cyan/teal` theme alias 는 호환용으로 남아 있지만 앱 코드의 공식 색 사용처는 semantic `ui-*` class 로 이동.
- 새 storage 정책 변경 시 `shared/storage/*` 중심으로 수정하면 됨.
- 검증: `npm run lint` 통과, `npm run build`(tsc -b + vite build) 통과(258 modules). dev 서버 `http://127.0.0.1:5173/` 기동 확인. Browser 플러그인은 현재 사용 가능한 브라우저 목록이 비어 있어 화면 자동 검증은 진행하지 못함.

### 관련
- 관련 파일: [FE_ARCHITECTURE_REPORT.md](./FE_ARCHITECTURE_REPORT.md), [storage](./src/shared/storage), [endpoints.ts](./src/shared/api/endpoints.ts), [branchApi.ts](./src/features/branch/api/branchApi.ts), [useOptimisticGraphMerge.ts](./src/features/conversation-explorer/hooks/useOptimisticGraphMerge.ts), [GraphPanel.tsx](./src/features/graph/components/GraphPanel.tsx), [index.css](./src/styles/index.css)

## 2026-06-03 — Claude (대형 컴포넌트 안전 분해 #1·#2·#7 + 보고서 반영)

**유형:** refactor
**범위:** pages/chat, features/graph, features/conversation-explorer

### 변경 내용
- **Refactoring #7 (GraphPanel 분해):** 약 1060줄 `GraphPanel.tsx` 의 순수 모듈 로직을 분리.
  - `features/graph/components/graphTypes.ts`(GraphNode/GraphEdge/BuiltGraph), `graphConstants.ts`(좌표·색 팔레트), `graphBuilders.ts`(buildGraph/buildGraphFromApiData/addBackboneEdges + 색 함수), `graphLayout.ts`(focused 레이아웃·요약 helper) 신설.
  - `GraphPanel.tsx` 는 컴포넌트(하이라이트 경로 + SVG 렌더)만 남김(약 430줄). 컴포넌트 본문은 그대로 보존.
- **Refactoring #1 (ChatLayout 분해):** 파생 상태를 `pages/chat/hooks/` 4개 hook 으로 분리 — `useChatRouteState`, `useActiveConversation`, `useBranchContext`, `useLiveMessageMerge`. 기존 `useMemo` 본문/의존성 배열을 그대로 옮겨 동작 동일. 핸들러·JSX 보존.
- **Refactoring #2 (ConvSidebar 핵심 분해):** 그래프 스냅샷 조회/낙관적 병합/확장/복구/에러 로직을 `features/conversation-explorer/hooks/useOptimisticGraphMerge.ts` 로 분리(`mergeOptimisticBranch`/`mergeGraphSnapshots` 포함). ConvSidebar JSX 보존.
- 보고서 `FE_ARCHITECTURE_REPORT.md` §4.3·§6.1·§11·§14 에 #1·#2·#7 적용 결과 반영.

### 영향 범위
- 동작 변경 없음(구조 개선 전용). 채팅 화면/그래프 표시/분기 생성·수정·삭제/SSE 스트리밍/사이드바 동작 동일.
- React hook 호출 순서는 각 컴포넌트 내에서 일관되게 유지(추출 hook 은 무조건 호출, 의존성 배열 동일).
- `useOptimisticGraphMerge` 는 원본과 동일하게 `React.useState`/`React.useEffect` 를 사용(`react-hooks/set-state-in-effect` 린트 회귀 방지 — 기존 effect 로직 보존).
- `restoreBranch`(비명세 API)는 동작 변경 없이 hook 으로 이동만 함(#6 BE 확인 전까지 유지).
- 검증: `npm run lint` 통과, `npm run build`(tsc -b + vite build) 통과(254 modules).

### 후속 작업(보류 — JSX 재배치 위험/ BE 확인)
- #1 `ChatMainPanel`, #2 `GraphSidebarPanel`/`ConversationExplorerPanel`, #7 `graphRendering`/`useGraphViewport` 분리는 렌더 구조 변경 위험이 있어 보류.
- #6 `restoreBranch` 명세 정합성은 BE 확인 후 결정.

### 관련
- 관련 파일: [GraphPanel.tsx](./src/features/graph/components/GraphPanel.tsx), [graphBuilders.ts](./src/features/graph/components/graphBuilders.ts), [graphLayout.ts](./src/features/graph/components/graphLayout.ts), [ChatLayout.tsx](./src/pages/chat/ChatLayout.tsx), [useBranchContext.ts](./src/pages/chat/hooks/useBranchContext.ts), [useOptimisticGraphMerge.ts](./src/features/conversation-explorer/hooks/useOptimisticGraphMerge.ts)

## 2026-06-03 — Claude (FE 아키텍처 보고서에 리팩토링 #3·#4·#5 적용 결과 반영)

**유형:** docs
**범위:** FE_ARCHITECTURE_REPORT.md

### 변경 내용
- `FE_ARCHITECTURE_REPORT.md` 가 #3·#4·#5 를 "후보"로만 서술하던 것을 **현재 적용 완료 상태**로 갱신.
- §11 각 Refactoring 항목에 상태 블록(✅ 적용 완료 / ⏸ 후속 과제)과 진행 현황 배너를 추가.
- §4.2(의존 그래프), §4.3(CBO), §6.1(SRP), §8.3(Interface Separation), §9(REP/CCP/CRP), §14(요약)에서 이미 해소된 사실 진술을 "해소됨"으로 정정.
- 문서 헤더에 갱신 메모 추가.

### 영향 범위
- 문서만 수정. 코드 변경 없음.
- #1·#2·#6·#7 은 후속 과제로 명확히 표기(미적용 상태 유지).

### 관련
- 관련 파일: [FE_ARCHITECTURE_REPORT.md](./FE_ARCHITECTURE_REPORT.md)

## 2026-06-03 — Claude (FE 아키텍처 보고서 §11 기반 안전 리팩토링 #3·#4·#5)

**유형:** refactor
**범위:** features/branch, features/chat, features/graph, features/usage, features/conversation-explorer, shared/api

### 변경 내용
- **Refactoring #3 (Branch mutation hook 신설):** `ConversationList.BranchRow` 가 직접 호출하던 `branchApi.updateBranch` / `branchApi.deleteBranch` / `queryClient.invalidateQueries` 를 `features/branch/hooks/useUpdateBranch.ts`, `features/branch/hooks/useDeleteBranch.ts` 로 분리. BranchRow 는 hook 의 `updateBranch`/`deleteBranch` 만 호출하고, 실패 시 제목 rollback·confirming 해제 UX 는 그대로 컴포넌트가 유지.
- **Refactoring #4 (공통 API schema 를 shared 로 이동):** `apiEnvelope`, `pageResponseSchema`, `TitleStatusSchema`, `SummaryStatusSchema` 를 `shared/api/schemas.ts` 로 통합. graph/branch/chat 에 중복 정의돼 있던 `apiEnvelope` 와, 특정 feature 에 있던 status/page 스키마를 한 곳으로 모으고 모든 import 경로를 shared 로 갱신. feature 간 schema 의존(graph→branch, explorer→branch/graph, usage→graph)을 제거.
- **Refactoring #5 (SSE 처리 통합):** `shared/api/sse.ts` 에 공통 파서 `parseSseBlock` 와 스트림 제너레이터 `parseSseStream` 를 두고 `streamSSE` 가 이를 사용하도록 정리. `features/chat/api/messageStream.ts` 는 중복 `parseSseBlock`/버퍼 루프를 제거하고 `parseSseStream` 을 소비하며 chat 전용 event 매핑(`turn_started`/`chunk`/`turn_completed`/`cancelled`/`error`/`done`)만 담당.

### 영향 범위
- 동작 변경 없음(구조 개선 전용). UI/라우팅/SSE 스트리밍/그래프/분기 생성·수정·삭제/사용량 결과 동일.
- Zod 검증 로직·스키마 정의 내용은 동일(정의 위치만 이동). `apiEnvelope` 등을 feature schema 에서 import 하던 코드는 모두 `shared/api/schemas` 로 변경됨 — 새 코드는 공통 스키마를 shared 에서 가져올 것.
- `messageStream` 의 `streamMessage` 시그니처(`signal` 포함)와 throw/handler 계약은 그대로 유지. SSE 소비 시 reader lock 해제(`releaseLock`)가 공통 제너레이터에서 일관되게 수행됨(기존 `streamSSE` 와 동일 패턴).
- 검증: `npm run lint` 통과, `npm run build`(tsc -b + vite build) 통과(246 modules).

### 후속 작업(TODO, 이번 변경에서 제외)
- Refactoring #6: 비명세 API `branchApi.restoreBranch`(`POST /chats/{id}/restore`) 는 BE 명세 확인이 필요하므로 이번에 제거하지 않음. 명세 확정 후 유지/제거 결정 필요.
- Refactoring #1·#2·#7(`ChatLayout`/`ConvSidebar`/`GraphPanel` 분해)은 위험도가 높아 이번 범위에서 제외. 별도 계획으로 진행 권장.

### 관련
- 관련 파일: [shared/api/schemas.ts](./src/shared/api/schemas.ts), [shared/api/sse.ts](./src/shared/api/sse.ts), [features/branch/hooks/useUpdateBranch.ts](./src/features/branch/hooks/useUpdateBranch.ts), [features/branch/hooks/useDeleteBranch.ts](./src/features/branch/hooks/useDeleteBranch.ts), [features/chat/api/messageStream.ts](./src/features/chat/api/messageStream.ts)

## 2026-06-03 — Codex (FE 아키텍처 보고서 강의자료 기반 보강)

**유형:** docs
**범위:** FE_ARCHITECTURE_REPORT.md

### 변경 내용
- `FE_ARCHITECTURE_REPORT.md`가 백엔드 보고서 형식에만 기대지 않도록 강의자료별 평가 프레임을 추가.
- `1 개요`, `2 Process`, `4 요구 분석`, `5 요구 모델링`, `6 설계 원리`, `6 설계 원리II`, `Architecture Design and Patterm`의 핵심 개념을 FE 분석 질문과 직접 매핑.
- Design Work Process, 기능/비기능 요구 매핑, 결합도/응집도 강의 정의, 아키텍처 스타일과 디자인 패턴 구분, SAAM/ATAM식 평가 시나리오를 보강.

### 영향 범위
- 문서만 수정. 코드 변경 없음.
- 기존 보고서의 결론은 유지하되, 근거를 강의자료 중심으로 재정렬함.

### 관련
- 관련 파일: [FE_ARCHITECTURE_REPORT.md](./FE_ARCHITECTURE_REPORT.md)

## 2026-06-03 — Codex (FE 아키텍처 분석 보고서 추가)

**유형:** docs
**범위:** FE_ARCHITECTURE_REPORT.md, FILE_STRUCTURE.md

### 변경 내용
- 백엔드 아키텍처 보고서 형식에 맞춰 `FE_ARCHITECTURE_REPORT.md`를 신규 작성.
- 강의 설계 원리 기준으로 FE의 아키텍처 스타일, 모듈 분할 근거, 결합도/응집도, SOLID, 디자인 패턴, 품질 속성, 리팩토링 후보를 정리.
- 신규 루트 문서 추가에 맞춰 `FILE_STRUCTURE.md` 루트 파일 목록에 보고서 항목을 추가.

### 영향 범위
- 문서만 추가/수정. 코드 변경 없음.
- prototype 브랜치의 현재 FE 구조를 기준으로 분석함.

### 관련
- 관련 파일: [FE_ARCHITECTURE_REPORT.md](./FE_ARCHITECTURE_REPORT.md), [FILE_STRUCTURE.md](./FILE_STRUCTURE.md)

## 2026-05-28 — Claude (모든 노드 부모 엣지 보강 + 대화 보기 카드 가림 해소)

**유형:** fix
**범위:** features/graph/components/GraphPanel.tsx

### 변경 내용
- **backbone 엣지 자동 추가**: `addBackboneEdges(graphData, nodes, edges)` 헬퍼 추가. window 절단으로 직접 부모가 안 보이는 노드(예: T3, T5 만 있고 T4 가 잘려서 T5 가 부모 없는 경우)에 대해 같은 chat 의 가까운 turn → 그 chat 의 marker → parentChat 의 분기점 이하 turn → … 순으로 재귀 검색해 가장 가까운 visible 조상으로 엣지를 잇는다. 결과: 모든 노드가 root 까지의 부모 체인을 시각적으로 가짐 (root T1 만 예외).
- **대화 보기 요약 카드 위치 동적화**: 카드 x 를 고정값(86) 대신 `max(모든 노드.x + 노드 반지름 + 16, 86)` 으로 계산. 깊은 분기 노드가 카드 위에 얹히던 문제 해소. svg viewBox/width 도 같이 갱신.

### 영향 범위
- 그래프에 endge 가 더 그려질 수 있음 (직접 부모가 안 보이는 경우). 동작 변화 없음, 시각만 보강.
- 대화 보기 카드 lane 이 노드 들여쓰기 깊이에 따라 오른쪽으로 이동. 깊은 분기가 있으면 그래프 패널이 넓어짐.
- 구조 보기는 외형/동작 변화 없음.

### 관련
- 관련 파일: [GraphPanel.tsx](src/features/graph/components/GraphPanel.tsx)

## 2026-05-28 — Claude (그래프 두 모드 정책 + 노드 클릭 AI 답변 정렬)

**유형:** feat
**범위:** features/graph/components/GraphPanel.tsx, features/chat/components/MessageList.tsx

### 변경 내용
- **대화 보기 정책 변경**: focused 모드에서 활성 경로만 보여주던 필터 제거. 모든 분기/노드를 항상 표시하고, 노드를 `createdAt` 시간순(ASC)으로 단일 컬럼에 위→아래 배치. 동시각 분기 marker/turn 은 depth 낮은 쪽이 먼저. x 는 분기 깊이에 따라 `FOCUSED_INDENT(22px)` 만큼 들여써 같은 chat 끼리 한 lane 으로 보이게 함.
- **GraphNode 모델 확장**: `createdAt`, `depth` 필드 추가. `buildGraph(legacy)` 와 `buildGraphFromApiData` 양쪽 모두 turn 노드는 메시지/turn 의 createdAt 으로, 분기 marker 는 `branchPointTurn.createdAt → 첫 branch turn createdAt → chat.updatedAt` 우선순위로 채움.
- **다른 노드 클릭해도 그래프 불변**: 구조 보기/대화 보기 모두 layout 이 selectedNodeId 와 무관. highlight 만 색으로 표시.
- **노드 클릭 → AI 답변이 입력창 바로 위**: MessageList 의 `targetTurnId` 스크롤이 `querySelector` → `querySelectorAll` + 마지막 요소로 변경 (같은 turnId 의 user/assistant 두 버블 중 assistant 선택). `block: 'center'` → `block: 'end'`. 직후 targetTurnId 가 null 로 풀리는 effect 가 바닥 스크롤로 덮어쓰지 않도록 `reachedTargetRef` 가드 추가.

### 영향 범위
- 대화 보기 외형이 "활성 경로 한 줄 + 요약 카드" → "모든 노드 시간순 + 깊이별 들여쓰기"로 바뀜. 엣지는 시간순 정렬 때문에 겹칠 수 있음 (사용자 의도).
- 구조 보기는 동작/외형 변화 없음.
- 노드 클릭 시 navigate 동작은 그대로, 스크롤 정렬만 변경.

### 관련
- 관련 파일:
  - [GraphPanel.tsx](src/features/graph/components/GraphPanel.tsx)
  - [MessageList.tsx](src/features/chat/components/MessageList.tsx)

---

## 2026-05-28 — Codex (design/graph를 prototype에 병합)

**유형:** feat
**범위:** features/conversation-explorer/components, features/graph

### 변경 내용
- `design/graph` 브랜치를 `prototype`에 병합.
- 사이드바 그래프 영역에 `대화 보기 / 구조 보기` 전환 컨트롤을 추가하고, `GraphPanel`에 `focused / structure` 뷰 모드를 연결.
- focused 그래프에서 턴/분기 요약 카드를 함께 보여주도록 그래프 노드에 summary 정보를 반영.
- 병합 충돌이 난 `GraphPanel.tsx`는 prototype의 그레이스케일 팔레트를 유지하면서 `design/graph`의 focused view 기능을 반영.

### 영향 범위
- 그래프 표시 UI 확장. 메시지 전송/분기 생성/API 호출 로직 변경 없음.
- `npm run build` / `npm run lint` 통과.
- `FILE_STRUCTURE.md` 변경 없음(신규 파일/폴더 추가 없음).

### 관련
- 병합 대상: `design/graph` → `prototype`
- 관련 파일: [src/features/conversation-explorer/components/ConvSidebar.tsx](src/features/conversation-explorer/components/ConvSidebar.tsx), [src/features/graph/components/GraphPanel.tsx](src/features/graph/components/GraphPanel.tsx), [src/features/graph/types.ts](src/features/graph/types.ts)

---

## 2026-05-28 — Codex (새 채팅 첫 응답 표시 복구)

**유형:** fix
**범위:** features/chat/hooks

### 변경 내용
- `/chat/new`에서 첫 메시지를 보낼 때 `createChat` 성공 직후 새 chatId 경로로 즉시 이동하도록 변경.
- 스트림이 끝날 때까지 `/chat/new`에 머물러 live 메시지가 현재 대화 필터에서 빠질 수 있던 흐름을 수정.

### 영향 범위
- 새 채팅 첫 질문 전송 UX 수정. 메시지 전송 API/SSE 처리 자체는 변경 없음.
- `npm run build` / `npm run lint` 통과.
- `FILE_STRUCTURE.md` 변경 없음(신규 파일/폴더 추가 없음).

### 관련
- 관련 파일: [src/features/chat/hooks/useSendMessage.ts](src/features/chat/hooks/useSendMessage.ts)

---

## 2026-05-27 — Codex (AI 응답 타이핑 속도 빠르게 조정)

**유형:** style
**범위:** features/chat/components

### 변경 내용
- AI 응답 타이핑 간격을 55ms에서 30ms로 줄여 더 빠르게 표시되도록 조정.

### 영향 범위
- UI 표시 속도만 변경. 메시지 전송/스트리밍/API 로직 변경 없음.
- `npm run build` / `npm run lint` 통과.
- `FILE_STRUCTURE.md` 변경 없음(신규 파일/폴더 추가 없음).

### 관련
- 관련 파일: [src/features/chat/components/MessageBubble.tsx](src/features/chat/components/MessageBubble.tsx)

---

## 2026-05-27 — Codex (AI 응답 타이핑 속도 재조정)

**유형:** style
**범위:** features/chat/components

### 변경 내용
- AI 응답 타이핑 간격을 85ms에서 55ms로 줄여 답답하지 않게 조정.

### 영향 범위
- UI 표시 속도만 변경. 메시지 전송/스트리밍/API 로직 변경 없음.
- `npm run build` / `npm run lint` 통과.
- `FILE_STRUCTURE.md` 변경 없음(신규 파일/폴더 추가 없음).

### 관련
- 관련 파일: [src/features/chat/components/MessageBubble.tsx](src/features/chat/components/MessageBubble.tsx)

---

## 2026-05-27 — Codex (새 AI 메시지 강제 타이핑 표시)

**유형:** fix
**범위:** features/chat/components, pages/chat

### 변경 내용
- 서버 히스토리에서 완료된 assistant 메시지가 한 번에 내려와도 새 메시지 id면 타이핑 대상으로 잡도록 `MessageList`에 타이핑 애니메이션 상태를 추가.
- 대화 진입 시 기존 히스토리는 애니메이션하지 않고, 현재 세션에서 새로 내용이 생긴 assistant 메시지만 타이핑 표시하도록 분리.
- `ConversationView`/`MessageList`에 현재 대화 id를 전달해 대화 전환 시 타이핑 대상 추적이 섞이지 않도록 조정.

### 영향 범위
- UI 표시 방식만 변경. 메시지 전송/스트리밍/API 로직 변경 없음.
- `npm run build` / `npm run lint` 통과.
- `FILE_STRUCTURE.md` 변경 없음(신규 파일/폴더 추가 없음).

### 관련
- 관련 파일: [src/features/chat/components/MessageList.tsx](src/features/chat/components/MessageList.tsx), [src/features/chat/components/MessageBubble.tsx](src/features/chat/components/MessageBubble.tsx)

---

## 2026-05-27 — Codex (AI 응답 타이핑 속도 추가 조정)

**유형:** style
**범위:** features/chat/components

### 변경 내용
- AI 응답 타이핑 효과를 45ms마다 1글자에서 85ms마다 1글자로 늦춰 GPT 응답 체감 속도에 가깝게 조정.
- 타이핑 간격 값을 상수로 분리해 후속 조정이 쉽도록 정리.

### 영향 범위
- UI 표시 속도만 변경. 메시지 전송/스트리밍/API 로직 변경 없음.
- `npm run build` / `npm run lint` 통과.
- `FILE_STRUCTURE.md` 변경 없음(신규 파일/폴더 추가 없음).

### 관련
- 관련 파일: [src/features/chat/components/MessageBubble.tsx](src/features/chat/components/MessageBubble.tsx)

---

## 2026-05-27 — Codex (AI 응답 타이핑 속도 완화)

**유형:** style
**범위:** features/chat/components

### 변경 내용
- AI 응답 타이핑 효과를 여러 글자 단위가 아니라 45ms마다 1글자씩 표시하도록 조정.

### 영향 범위
- UI 표시 속도만 변경. 메시지 전송/스트리밍/API 로직 변경 없음.
- `npm run build` / `npm run lint` 통과.
- `FILE_STRUCTURE.md` 변경 없음(신규 파일/폴더 추가 없음).

### 관련
- 관련 파일: [src/features/chat/components/MessageBubble.tsx](src/features/chat/components/MessageBubble.tsx)

---

## 2026-05-27 — Codex (AI 응답 타이핑 효과 유지 수정)

**유형:** fix
**범위:** features/chat/components

### 변경 내용
- assistant 응답이 스트리밍 live 메시지에서 서버 히스토리 메시지로 교체돼도 같은 메시지 id면 타이핑 효과를 이어가도록 수정.
- 빠르게 도착한 chunk 때문에 타이핑 interval 이 계속 재시작되며 전체 답변이 한 번에 보일 수 있던 흐름을 보완.

### 영향 범위
- UI 표시 방식만 변경. 메시지 전송/스트리밍/API 로직 변경 없음.
- `npm run build` / `npm run lint` 통과.
- `FILE_STRUCTURE.md` 변경 없음(신규 파일/폴더 추가 없음).

### 관련
- 관련 파일: [src/features/chat/components/MessageBubble.tsx](src/features/chat/components/MessageBubble.tsx)

---

## 2026-05-27 — Codex (채팅 헤더·입력 하단·AI 타이핑 표시 정리)

**유형:** style
**범위:** features/chat/components, styles/index.css

### 변경 내용
- 채팅 헤더의 이미지 로고를 텍스트 `AIT` 워드마크로 교체.
- 채팅 입력창 하단의 `AIT는 현재 백엔드 연결을 준비 중입니다.` 안내 문구 제거.
- assistant 응답이 스트리밍 중 `content`를 받으면 로딩 점만 유지하지 않고, 본문을 타이핑 효과로 점진 표시하도록 변경.
- 타이핑 중에는 복사/분기/재생성 액션이 노출되지 않도록 기존 생성 중 상태와 분리.

### 영향 범위
- 기능/API/라우팅 변경 없음. 응답 표시 UX만 변경.
- `npm run build` / `npm run lint` 통과.
- `FILE_STRUCTURE.md` 변경 없음(신규 파일/폴더 추가 없음).

### 관련
- 관련 파일: [src/features/chat/components/ChatHeader.tsx](src/features/chat/components/ChatHeader.tsx), [src/features/chat/components/ChatInput.tsx](src/features/chat/components/ChatInput.tsx), [src/features/chat/components/MessageBubble.tsx](src/features/chat/components/MessageBubble.tsx)

---

## 2026-05-27 — Codex (포인트 컬러 그레이스케일 정리)

**유형:** style
**범위:** styles/index.css, features/graph/components, features/auth/components, features/member/components

### 변경 내용
- 주황/테라코타 계열 포인트 컬러를 제거하고 흰색·회색·검정 중심의 그레이스케일 팔레트로 전환.
- `--red`, `--red-deep`, `--gold` 및 Tailwind `cyan`/`teal` 별칭을 기존 참조 호환은 유지하되 실제 색상은 차콜/그레이로 재매핑.
- 그래프 노드 선택/강조/분기 색상과 에러 배경 rgba 값을 그레이스케일에 맞게 조정.

### 영향 범위
- 색상만 변경. 기능/API/라우팅 변경 없음.
- `FILE_STRUCTURE.md` 변경 없음(신규 파일/폴더 추가 없음).

### 관련
- 관련 파일: [src/styles/index.css](src/styles/index.css), [src/features/graph/components/GraphPanel.tsx](src/features/graph/components/GraphPanel.tsx)

---

## 2026-05-27 — Codex (신문 테마 모던 에디토리얼 정리)

**유형:** style
**범위:** styles/index.css, pages, features/chat/components, features/auth/components, features/member/components, features/graph/components

### 변경 내용
- 신문 콘셉트의 큰 레이아웃은 유지하되 `구독/호외/편집국/독자` 중심 문구를 `로그인/회원가입/분기/AI/마이페이지/설정` 표현으로 정리.
- 마스트헤드, 인장, 줄무늬, 강한 보더/그림자 등 무거운 장식을 줄이고 Pretendard 기반 sans 본문 + Lora 헤드라인 중심의 모던 에디토리얼 톤으로 조정.
- 채팅 입력/메시지 액션/계정 삭제/플랜/최근 대화/사용량 카드의 버튼과 안내 문구를 현재 기능명에 맞게 변경.
- `MessageBubble`의 분기 생성, 재생성, 수정, 복사 핸들러 및 마이페이지/설정/인증 동작 연결은 유지하고 UI 표현만 정리.

### 영향 범위
- 기능/API/라우팅 변경 없음. 단, 계정 삭제 모달의 확인 입력 문구가 `구독 해지`에서 `계정 삭제`로 바뀜.
- `npm run build` / `npm run lint` 통과.
- `FILE_STRUCTURE.md` 변경 없음(신규 파일/폴더 추가 없음).

### 관련
- 관련 파일: [src/styles/index.css](src/styles/index.css), [src/pages/LoginPage.tsx](src/pages/LoginPage.tsx), [src/pages/MyPage.tsx](src/pages/MyPage.tsx), [src/pages/SettingsPage.tsx](src/pages/SettingsPage.tsx), [src/features/chat/components/MessageBubble.tsx](src/features/chat/components/MessageBubble.tsx)

---

## 2026-05-27 — Codex (prototype에 신문 테마 병합 — 기능 보존 충돌 해결)

**유형:** style
**범위:** features/chat/components, features/graph/components, features/member/components, pages

### 변경 내용
- `design/newspaper-theme` 를 `prototype` 에 병합하면서 충돌 파일 6개를 수동 해결.
- `ChatHeader` 는 Phase 4 사용량 경고 칩과 로고 기능을 유지하고, 신문 테마 헤더/메뉴/스탬프 스타일을 반영.
- `UsageMeter` 는 `/usage/me` 실데이터 연동을 유지한 채 신문 테마 gauge 스타일로 표시하도록 조정.
- `GraphPanel` 은 prototype 의 depth 정렬/하이라이트/zoom/dim 로직을 유지하고, 노드/엣지 팔레트와 SVG 텍스트 스타일만 신문 테마로 정리.
- `LoginPage`, `MyPage` 는 신문 테마 레이아웃을 유지하되 Phase 4 사용량 컴포넌트 호출 구조를 보존.

### 영향 범위
- 기능 변경을 의도하지 않은 디자인 병합. Phase 4 API/탐색기/사용량/그래프 동작은 prototype 기준으로 유지.
- `FILE_STRUCTURE.md` 변경 없음(신규 파일/폴더 추가 없음).

### 관련
- 병합 대상: `design/newspaper-theme` → `prototype`
- 관련 파일: [ChatHeader.tsx](src/features/chat/components/ChatHeader.tsx), [GraphPanel.tsx](src/features/graph/components/GraphPanel.tsx), [UsageMeter.tsx](src/features/member/components/UsageMeter.tsx), [LoginPage.tsx](src/pages/LoginPage.tsx), [MyPage.tsx](src/pages/MyPage.tsx)

---

## 2026-05-27 — Claude (사이드바 대화 트리 — 파일 탐색기형 삼각형 토글)

**유형:** style
**범위:** features/conversation-explorer/components/ConversationList.tsx

### 변경 내용
- **root 대화 펼침 표시**를 행 맨 오른쪽의 `▸/▾` 텍스트 → **제목 앞(왼쪽)의 회전 삼각형**으로 이동. 펼침 시 90° 회전(▶→▼), `transition-transform`.
- **분기 행의 문서 아이콘 → 삼각형 마커로 교체.** 하위 분기가 있는 분기는 회전 삼각형 + 클릭 시 그 하위 트리를 접기/펼치기(파일 트리), 말단 분기는 작은 정적 삼각형.
- 공용 `DisclosureTriangle` 컴포넌트 추가(회전 삼각형 svg).
- `ConversationRow` 에 분기 접힘 상태(`collapsedBranchIds`) + 가시성 계산(`visibleBranches`, 접힌 조상 분기의 하위는 숨김) 추가. 상태는 컴포넌트 로컬이라 ConvSidebar 등 상위는 변경 없음.

### 영향 범위
- 사이드바 트리의 시각적 변경만. 데이터/라우팅/선택 동작은 그대로(행 클릭=이동+root 펼침, 분기 삼각형 클릭=하위 접기 토글).
- `tsc -b` / `eslint` / `vite build` 통과.

### 관련
- 관련 파일: [ConversationList.tsx](src/features/conversation-explorer/components/ConversationList.tsx)

---

## 2026-05-27 — Claude (Phase 4 구현 — 대화 탐색기 + 토큰 사용량 + 맥락 압축 통보)

**유형:** feat
**범위:** features/conversation-explorer, features/usage, features/chat, features/member, features/branch, pages, shared/api

### 변경 내용
- **대화 탐색기 (FG-4, 명세 §2.1).** 신규 `features/conversation-explorer/api`·`types`·`utils`:
  - `explorerApi.getExplorerPage` / `getExplorerTree` — `GET /chats/explorer`(트리 페이지), `GET /chats/explorer/{rootChatId}`(단일 트리, §2.2 선택) 클라이언트 + zod 스키마.
  - `explorerMappers.mapExplorerPageToConversations` — 탐색기 평탄 노드(depth/parentChatId)를 기존 `Conversation`/`Branch` 모델로 변환.
- **[BREAKING] 사이드바 데이터 소스 교체.** `useConversations` 가 `/chats`(루트만) → `/chats/explorer`(루트 + 하위 분기 트리)를 호출하도록 변경. 결과를 동일한 `Conversation[]` 으로 매핑하므로 소비처 인터페이스는 동일하나, **이제 사이드바 목록에 분기 트리가 함께 채워진다**(이전에는 분기가 그래프에서만 보임). 정렬 기본값 `recent`(lastActivityAt DESC). `titleStatus: PENDING` 동안 3초 폴링.
- **토큰 사용량 (FR-5.3, 명세 §3.3).** 신규 `features/usage`:
  - `usageApi.getMyUsage`(`GET /usage/me`) + `useUsage` 훅(404 `USAGE_4041` 재시도 안 함).
  - `UsageMeter` 를 실데이터(`tokensUsed/tokenLimit/usageRatio/warningLevel`)로 교체. 무제한(`tokenLimit=0`)·경고색(WARN/CRITICAL) 처리.
  - `ChatHeader` 에 사용량 경고 칩(§5.3) 추가 — WARN/CRITICAL 시 `토큰 N%` 표시, 클릭 시 마이페이지 이동.
- **SSE `turn_completed` 확장 (명세 §3.4).** `TurnCompletedData` 에 `contextTokens`·`compressionApplied`·`compressedTurnCount` 추가. 압축 적용 시 info 토스트(`compressionNotice`), 송신/재생성/수정 완료 시 `['usage']` 무효화로 사용량 즉시 갱신.
- **에러 코드/엔드포인트.** `EXPLORER_4001`·`CONTEXT_4001`·`USAGE_4041` 메시지 매핑, `ENDPOINTS.explorer`·`ENDPOINTS.usage` 추가.
- **Branch 모델 확장.** `depth`·`branchPointTurnId`(옵션) 추가 → 사이드바 깊이 들여쓰기 + 활성 분기 fork 위치 재계산. `ConversationList` 가 depth 로 손자 분기를 들여쓰고, turn 인덱스 미상 분기는 `T{n}` 배지를 숨김.
- **ChatLayout 활성 분기 보정.** 탐색기 분기는 turn 인덱스를 모르므로(`forkAtTurnIndex=0`), `branchPointTurnId` + 부모 메시지로 fork 위치를 항상 재계산하도록 `activeBranch`/`metaBranchPointTurnId` 수정.

### 영향 범위
- **사이드바 미리보기 텍스트 변화:** 탐색기 응답에는 `lastMessagePreview` 가 없어(명세 §8.1 payload 최소화), 루트 미리보기가 마지막 메시지 발췌 → `"{turnCount}개의 턴"` 으로 바뀜.
- `chatApi.getConversations` / `mapChatListItemToConversation` 은 이번 교체로 사용처가 사라졌으나(다른 곳에서 호출될 수 있어) 제거하지 않고 보존.
- 신규 API: `GET /chats/explorer`, `GET /chats/explorer/{rootChatId}`, `GET /usage/me`. 의존성/환경변수 변경 없음.
- `npx tsc -b` / `eslint` / `vite build` 통과.

### 관련
- 명세: [api_phase4_v6.md](../document/phase4/api_phase4_v6.md), BE 요약(AI-star-be `docs/phase4_document/phase4_summary.md`)
- 관련 파일: [features/conversation-explorer/](src/features/conversation-explorer/), [features/usage/](src/features/usage/)

---

## 2026-05-27 — Claude ([BREAKING] 디자인 리뉴얼 Phase 2 — The AIT Times 컴포넌트 마이그레이션)

**유형:** style
**범위:** styles/index.css, pages/_, features/chat/components, features/auth/components, features/member/components, features/settings/components

### 변경 내용
Phase 1(토큰)에 이어 시안([design-newspaper.html](design-newspaper.html))의
**컴포넌트 형태/타이포그래피/패턴을 실제 React 코드에 반영**.

**styles/index.css — 신문 의미 클래스 일괄 추가**
- `.nm-masthead / .nm-mast-top / .nm-mast-name / .nm-mast-tagline / .nm-mast-badge` (마스트헤드)
- `.nm-mini-mast` (페이지 상단 작은 제호)
- `.nm-kicker / .nm-headline (xl/lg/md/sm) / .nm-subhead / .nm-lede / .nm-byline / .nm-ornament` (타이포그래피)
- `.nm-frame / .nm-side-box` (페이지 컨테이너)
- `.nm-letter / .nm-letter-from / .nm-letter-body` (독자의 질문 = 사용자 메시지)
- `.nm-article / .nm-article-body` (기사 = AI 메시지)
- `.nm-extra-tag / .nm-stamp (bw/gold)` (도장/뱃지)
- `.nm-btn / .nm-btn-red / .nm-btn-ghost` (버튼 3종)
- `.nm-composer / .nm-composer-head` (메시지 입력 박스)
- `.nm-input / .nm-label` (하단 보더 인풋)
- `.stat-cell-item:last-child` (마지막 stat 셀 우측 보더 제거)

**채팅 영역**
- [ChatHeader.tsx](src/features/chat/components/ChatHeader.tsx) — 다크 헤더 → 페이퍼 카드 + 미니 마스트헤드 + 잉크 외곽선 드롭다운 (8x8 오프셋 그림자); 라벨 "독자 카드 / 편집국 설정 / 구독 해지". 로고는 `AIT`만 사용
- [NewChatLanding.tsx](src/pages/chat/NewChatLanding.tsx) — 안 보이던 `text-white` 헤딩 → `.nm-headline xl` (이름 골드 이탤릭) + `.nm-lede` 부제 + `.nm-ornament` 장식
- [MessageBubble.tsx](src/features/chat/components/MessageBubble.tsx) — 둥근 버블/아바타 → **사용자 = `.nm-letter`("독자의 질문" 라벨, 사선 빨강 줄무늬 배경)**, **AI = `.nm-article`(`BY. AIT · EDITORIAL` 바이라인 + 본문)**. 액션 버튼 typewriter 캡스(`⎘ 복사 / ⤴ 호외 발행 / ↻ 재집필 / ✎ 수정 / 재발신 ▸`)
- [ChatInput.tsx](src/features/chat/components/ChatInput.tsx) — `.nm-composer` (잉크 외곽선 + 6~8px 오프셋 그림자 + 이탤릭 textarea). 발행 `발행 ▸` / 중단 `중단 ◼` typewriter 캡스. dock 변형은 위쪽 페이퍼-aged 그라디언트 룰

**로그인 (No.03 Subscription)**
- [LoginPage.tsx](src/pages/LoginPage.tsx) — 다크 풀스크린 → 풀 마스트헤드 + 2-col(좌: kicker/헤드라인/풀쿼트/4 features, 우: 잉크 보더 구독 카드)
- [EmailLoginForm.tsx](src/features/auth/components/EmailLoginForm.tsx) / [EmailSignupForm.tsx](src/features/auth/components/EmailSignupForm.tsx) — 둥근 다크 인풋 → `.nm-input` 하단 보더 인풋 (포커스 시 빨강) + `.nm-label` typewriter + `.nm-btn-red` "구독 시작 ▸ / 신규 구독 ▸"

**마이페이지 (No.04 Reader's Card)**
- [MyPage.tsx](src/pages/MyPage.tsx) — 셸을 READER'S DESK 마스트헤드 + 풀폭 ProfileCard + 2-col 그리드(좌: stats+gauge, 우: PlanCard+RecentConversations) + DangerZone 으로 재구성
- [ProfileCard.tsx](src/features/member/components/ProfileCard.tsx) — 그라디언트 카드 → reader-card 그리드 + **빨강 인장 도장(-6° 회전: CERT./이니셜/SUBSCRIBER)**
- [StatCard.tsx](src/features/member/components/StatCard.tsx) — 둥근 카드 → 잉크 보더로 묶은 한 줄의 셀(42px Playfair 숫자 + typewriter 라벨/델타)
- [UsageMeter.tsx](src/features/member/components/UsageMeter.tsx) — 그라디언트 막대 → **45° 사선 패턴 gauge** (잉크 보더 + 페이퍼 배경)
- [PlanCard.tsx](src/features/member/components/PlanCard.tsx) — 그라디언트 카드 → 광고 박스 (-45° 빗금 배경 + 2px 잉크 보더 + ₩9,900 큰 세리프 + `업그레이드 ▸`)
- [RecentConversations.tsx](src/features/member/components/RecentConversations.tsx) — 둥근 행 리스트 → `.nm-side-box` 점선 구분 행 ("X 호외" + 상대 시간)
- [DangerZone.tsx](src/features/member/components/DangerZone.tsx) — 회색 카드 → 빨강 보더 + 45° 빨강 빗금 ("구독 해지 ▸")
- [DeleteAccountModal.tsx](src/features/member/components/DeleteAccountModal.tsx) — 다크 모달 → 신문지 모달 (FINAL NOTICE 헤더, 입력 "구독 해지" 확인)
- [PlanBadge.tsx](src/features/member/components/PlanBadge.tsx) — `badge-free/badge-pro` → `.nm-stamp bw / .nm-stamp gold`

**설정 (No.05 Editorial Desk)**
- [SettingsPage.tsx](src/pages/SettingsPage.tsx) — 다크 셸 → EDITORIAL DESK 마스트헤드 + 더블룰 구분 `.set-section` ("― 발행 환경 General ― / ― 기사 작성 Composing ―") + 점선 하단 보더 `.set-row` 패턴 + "Printed in Seoul · 편집국 02번 데스크" 푸터
- [SettingsSelect.tsx](src/features/settings/components/SettingsSelect.tsx) — 다크 둥근 select → 잉크 보더 + typewriter 캡스 select (label prop 선택형으로 완화 — set-row 가 라벨 별도 렌더)

### 영향 범위
- **모든 페이지의 시각적 인상이 신문지로 통일됨**. 컴포넌트 함수 시그니처는 거의 그대로(SettingsSelect의 `label`만 optional 로 완화).
- `text-white` 하드코딩 문제는 해당 컴포넌트들이 재작성되며 자연 해소(MessageBubble, MyPage, SettingsPage, LoginPage, NewChatLanding 헤더 모두 처리). 미터치 컴포넌트(ProtectedRoute, ConvSidebar 등)에는 여전히 잔존 — Phase 3 후속 작업으로 남김.
- 기존 `.bubble-user / .bubble-ai / .card / .card-inner / .input-dark / .sidebar-item / .sidebar-item-active / .badge-free / .badge-pro / .section-label / .text-gradient-blue` 클래스는 미사용 컴포넌트가 아직 참조하므로 **삭제하지 않고 유지**(점진 폐기 예정).
- 신문 메타포로 일부 한국어 문구가 바뀜: 마이페이지 → 독자 카드, 환경 설정 → 편집국 설정, 분기 → 호외, 계정 삭제 → 구독 해지, 회원가입 → 신규 구독, 로그인 → 구독 신청.
- 그래프 패널, 사이드바, 검색 등 채팅 페이지의 잔여 컴포넌트는 미터치(Phase 3).

### 관련
- 시안: [design-newspaper.html](design-newspaper.html) (No.01~No.05 5개 화면)
- 브랜치: `design/newspaper-theme`
- 이전: [Phase 1 토큰 변경](#2026-05-27--claude-breaking-디자인-리뉴얼-phase-1--the-ait-times-신문-테마-토큰)
- 다음 (Phase 3 후보):
  - 채팅 사이드바(ConvSidebar) → "오늘의 목차" TOC 패턴
  - 그래프 패널(GraphPanel) → 분기 지도(map-canvas) 패턴
  - 잔여 `text-white` 정리 (ProtectedRoute, MessageList 등)

---

## 2026-05-27 — Claude ([BREAKING] 디자인 리뉴얼 Phase 1 — The AIT Times 신문 테마 토큰)

**유형:** style
**범위:** styles/index.css, index.html

### 변경 내용
- 전역 디자인 시스템을 **워밍 라떼 → AIT Times 신문 테마**로 1차 전환.
  컴포넌트 클래스(.card, .bubble-user 등) 구조는 그대로 두고, **Tailwind
  팔레트(slate/cyan/teal) 매핑만 신문 색상으로 재정의**.
  팔레트(빈도 많이→적게) — 실제 신문지의 매트한 따뜻한 그레이 톤으로
  채도를 낮춰서 따뜻한 크림보다 "인쇄용지"에 가깝게 조정:
  1. `#DAD6CB` paper       — 페이지 배경 (그레이쪽으로 시프트)
  2. `#E2DED3` paper-card  — 카드/표면 (살짝 밝게)
  3. `#1A1612` ink         — 본문 텍스트
  4. `#9A2C25` red         — 액센트 (살짝 채도 낮춤)
  5. `#97793A` gold        — 희소 강조
- Tailwind 별칭 매핑(의미 유지):
  - `slate` — paper↔ink 중립 스케일(반전: 950=배경 종이, 50=잉크 텍스트)
  - `cyan`  — red 액센트 스케일
  - `teal`  — gold 강조 스케일
- `:root`에 `--paper / --ink / --red / --gold / --rule / 폰트` 등 신문
  디자인 변수 추가 (Phase 2 의미 클래스에서 직접 사용 예정).
- `index.html`에 Google Fonts 추가: Playfair Display, Noto Serif KR,
  Special Elite (preconnect 포함).
- `body` 폰트를 `Noto Serif KR / Playfair Display` 세리프로 변경.
- `body::before`에 SVG 노이즈 기반 **종이 질감 오버레이** 적용
  (`mix-blend-mode: multiply`, opacity 0.35). 컨텐츠가 가려지지 않도록
  `#root`에 `position: relative; z-index: 1`.

### 영향 범위
- 전 페이지의 배경/카드/액센트 색이 즉시 신문 톤으로 바뀐다.
  컴포넌트 코드는 0줄 수정.
- 본문 폰트가 sans → serif 로 바뀌어 가독·줄높이 인상이 달라진다.
  좁은 컴포넌트(뱃지 등)에서 라인 정렬 미세 변화가 있을 수 있다.
- `.bubble-user`가 `bg-cyan-700`을 사용 → 새 매핑상 **딥 레드**(`#7E2018`)
  로 바뀐다. 신문 액센트로는 의도된 방향이지만 Phase 2에서 의미 클래스
  (`독자의 질문` 편지 박스)로 교체될 예정.
- 라운드 코너(`rounded-3xl` 등)와 그림자는 그대로다. 박스화/마스트헤드 등
  형태 작업은 Phase 2 범위.
- Google Fonts 외부 의존성이 추가됨(네트워크 첫 로드 시 폰트 다운로드).

### 관련
- 시안: [design-newspaper.html](design-newspaper.html)
- 관련 파일: [src/styles/index.css](src/styles/index.css), [index.html](index.html)
- 다음 단계: Phase 2 — 둥근 모서리 박스화, `.headline/.kicker/.byline` 의미 클래스, 채팅 페이지부터 컴포넌트 재단

---

## 2026-05-26 — Claude ([BREAKING] 디자인 컬러 리뉴얼 — 웜 라떼 라이트 테마)

**유형:** style
**범위:** styles/index.css

### 변경 내용
- 전역 컬러 테마를 **다크 → 라이트**로 전환. 4색 팔레트 기반 따뜻한 "라떼" 톤. 빈도 순서(많이→적게):
  1. `#EDE9E6` 크림 — 배경/표면 (최빈)
  2. `#C9996B` 카멜 — 액센트(버튼·유저버블·링크·활성·포커스)
  3. `#5C4F4A` 브라운 — 본문/주요 텍스트
  4. `#5C766D` 세이지 — 그라디언트 끝색 등 희소 강조 (최소)
- `styles/index.css`의 `@theme` 블록에서 Tailwind 기본 팔레트(`slate`/`cyan`/`teal`) 스케일을 재정의. 컴포넌트 32개 파일(180여 곳) 유틸리티 클래스는 그대로 둠.
  - `slate` → 크림↔브라운 중립 스케일을 **반전**(950=밝은 배경, 200=어두운 텍스트)하여 다크→라이트 전환을 컴포넌트 수정 없이 달성.
  - `cyan` → 카멜 액센트. 채움 셰이드(500~700)는 어둡게 두어 그 위 밝은 텍스트(`text-white`/cream) 대비 확보.
  - `teal` → 세이지.
- 라이트 전환으로 깨지는 핵심 조합 1곳만 컴포넌트 수정: `.sidebar-item-active` 활성 텍스트를 `text-cyan-200`(밝은 탄, 라이트 배경에서 안 보임) → `text-cyan-700`(어두운 카멜)로 변경.
- `amber`/`red`/`emerald`/`rose` 등 의미색은 그대로 유지.

### 영향 범위
- **[BREAKING] 다크→라이트 전환.** 클래스 이름은 그대로지만 실제 색 의미가 반전됨 — `bg-slate-950`은 이제 **밝은 크림**, `text-slate-200`은 **어두운 브라운**, `text-cyan-*`은 **카멜**. 신규 작업 시 색 이름과 실제 색의 괴리에 유의(인라인 주석에 매핑·반전 규칙 명시).
- 액센트 채움 위 `text-slate-950`/`text-white`를 쓰는 곳(Button primary, 유저 버블, 아바타, 에러 화면)은 채움 셰이드를 어둡게 잡아 대비를 확보함. 카멜+크림 팔레트 특성상 일부 장식 텍스트는 저대비이나 본문 텍스트(브라운 on 크림)는 약 7:1로 충분.
- 빌드 검증 완료(`vite build` 성공, 컴파일 CSS에 4색 앵커 hex 반영 확인).
- `public/`의 정적 색은 의도적으로 건드리지 않음.

### 관련
- 관련 파일: [styles/index.css](src/styles/index.css)

---

## 2026-05-26 — Claude (수정제안서에 Phase 4 명세서 피드백 추가)

**유형:** docs
**범위:** 수정제안서.md

### 변경 내용
- `수정제안서.md` 맨 아래에 §4 "Phase 4 명세서(v0.6) 피드백" 섹션 추가 — FE 관점에서 명세 문서 자체의 정합성·완결성 검토.
- 발견 이슈 4건: P4F-1 `turn_completed` 신규 필드 전송 조건이 §3.2↔§3.4↔§5.3에서 모순(🔴), P4F-2 `CONTEXT_4001`에 대응 엔드포인트 부재(🟠), P4F-3 빈 사용자 탐색기 응답 미명시(🟡), P4F-4 `usageRatio` 타입 표기 불일치(🟡).

### 영향 범위
- 문서만 수정. 코드 변경 없음.
- P4F-1은 §2 BE-3, P4F-2는 §1 F4-5와 직결 — 명세 측 답변에 따라 FE 구현 확정.

### 관련
- 관련 파일: [수정제안서.md](수정제안서.md), [api_phase4_v6.md](../document/phase4/api_phase4_v6.md)

---

## 2026-05-25 — Claude (FE 구조 7가지 개선 + Phase 3 API 정합성 수정)

**유형:** refactor
**범위:** shared/utils, features/chat, features/branch, features/graph, features/member, pages/chat

### 변경 내용
- `app/providers/toastEvents.ts` → `shared/utils/toastEvents.ts` 이동 (레이어 역전 해소). 기존 경로는 re-export shim 유지.
- `features/chat/api/streamTypes.ts` 신설 — SSE 이벤트 타입(`TurnStartedData`, `ChunkData`, `TurnCompletedData`, `CancelledData`, `BranchCreatedData`, `StreamErrorData`) 통합. `messageStream.ts`, `useRegenerate.ts`, `useEditMessage.ts` 중복 정의 제거.
- **Phase 3 §4.1 v0.7 정합**: `useRegenerate.ts` 에서 `branch_created` 이벤트 처리 및 `navigate` 제거. regenerate 는 같은 chat 내 AI 메시지를 덮어씀(분기 미생성).
- **Phase 3 §8 정합**: `ChatMessageResponse` 에 `chatId?: number` 추가. `chatMappers.ts` 의 `mapMessageResponseToMessage` 가 서버 제공 `chatId` 를 우선 사용.
- `features/auth/api/memberApi.ts` → `features/member/api/memberApi.ts` 이동. 기존 경로는 re-export shim 유지. `AuthProvider` 임포트 경로 갱신.
- `features/branch/hooks/useChatTitle.ts` → `features/graph/hooks/useChatTitle.ts` 이동 (소유권 정렬).
- `features/branch/hooks/useCreateBranch.ts` 신설 — `ChatLayout` 에서 직접 `branchApi` 호출·`useQueryClient` 사용 제거. God Component 해소.
- `src/mocks/` → `src/shared/mocks/` 이동 (`conversations.ts`, `messages.ts`). 기존 경로는 re-export shim 유지.

### 영향 범위
- `useRegenerate` 를 사용하는 곳에서 더 이상 분기 이동(`navigate`)이 발생하지 않음. 메시지가 같은 chat 에서 교체됨.
- `TurnStartedData.chatId` 가 optional 로 추가됨 — send/regenerate 에서는 없을 수 있음.
- `npx tsc --noEmit` 오류 없음 확인.

### 관련
- 참조 명세: BE Phase 3 API §4.1 (v0.7 regenerate 변경), §8 (`GET /chats/{chatId}/turns` chatId 필드)
- 관련 파일: [src/shared/utils/toastEvents.ts](./src/shared/utils/toastEvents.ts), [src/features/chat/api/streamTypes.ts](./src/features/chat/api/streamTypes.ts), [src/features/member/api/memberApi.ts](./src/features/member/api/memberApi.ts), [src/features/graph/hooks/useChatTitle.ts](./src/features/graph/hooks/useChatTitle.ts), [src/features/branch/hooks/useCreateBranch.ts](./src/features/branch/hooks/useCreateBranch.ts)

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
