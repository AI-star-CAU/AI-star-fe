import type { Message } from '../../features/chat/types';

const t = (offsetMin: number) =>
  new Date(Date.now() - 1000 * 60 * offsetMin).toISOString();

export const MOCK_MESSAGES: Record<string, Message[]> = {
  c1: [
    { id: 'm1', conversationId: 'c1', role: 'assistant', content: '안녕하세요! AIT입니다. 무엇이든 물어보세요.\n\n대화는 트리 구조로 관리되며, 원하는 시점에서 새로운 분기를 만들 수 있습니다.', createdAt: t(29) },
    { id: 'm2', conversationId: 'c1', role: 'user', content: 'SRS에서 기능 요구사항과 비기능 요구사항의 차이를 설명해줘.', createdAt: t(28) },
    { id: 'm3', conversationId: 'c1', role: 'assistant', content: '**기능 요구사항 (FR)**\n시스템이 *무엇을* 해야 하는지를 정의합니다.\n\n**비기능 요구사항 (NFR)**\n시스템이 *어떻게* 동작해야 하는지 품질 기준을 정의합니다.', createdAt: t(27) },
    { id: 'm4', conversationId: 'c1', role: 'user', content: 'AIT의 SRS에서 가장 중요한 기능 요구사항은 뭐야?', createdAt: t(22) },
    { id: 'm5', conversationId: 'c1', role: 'assistant', content: 'AIT SRS 기준 핵심 기능 요구사항:\n1. FR-1.1 메시지 송신\n2. FR-2.1 분기 생성\n3. FR-3.1 그래프 구조 표시', createdAt: t(21) },
  ],
  b1: [
    { id: 'b1m0', conversationId: 'b1', role: 'assistant', content: '유스케이스 분석 브랜치입니다.', createdAt: t(26) },
    { id: 'b1m1', conversationId: 'b1', role: 'user', content: '유스케이스 다이어그램은 어떻게 작성해?', createdAt: t(25) },
    { id: 'b1m2', conversationId: 'b1', role: 'assistant', content: '유스케이스 다이어그램 작성 단계:\n1. 시스템 경계 정의\n2. 액터 식별\n3. 유스케이스 도출\n4. 관계 표시', createdAt: t(24) },
  ],
  b2: [
    { id: 'b2m0', conversationId: 'b2', role: 'assistant', content: '비기능 요구사항 심화 브랜치입니다.', createdAt: t(20) },
    { id: 'b2m1', conversationId: 'b2', role: 'user', content: 'FURPS+ 모델에서 각 요소를 AIT에 적용해서 설명해줘.', createdAt: t(19) },
    { id: 'b2m2', conversationId: 'b2', role: 'assistant', content: 'AIT에 FURPS+ 적용:\n- F: 분기 생성·메시지 전송·그래프 조회\n- U: 직관적 분기 그래프 UI\n- R: 메시지 유실 없는 99.9% 가용성', createdAt: t(18) },
  ],
  c2: [
    { id: 'c2m0', conversationId: 'c2', role: 'assistant', content: 'React 최적화에 대해 알아보겠습니다.', createdAt: t(110) },
    { id: 'c2m1', conversationId: 'c2', role: 'user', content: 'useMemo와 useCallback의 차이점을 설명해줘.', createdAt: t(109) },
    { id: 'c2m2', conversationId: 'c2', role: 'assistant', content: '**useMemo** — 값을 메모이제이션\n**useCallback** — 함수를 메모이제이션', createdAt: t(108) },
  ],
  b3: [
    { id: 'b3m0', conversationId: 'b3', role: 'assistant', content: 'Concurrent 모드 브랜치입니다.', createdAt: t(88) },
    { id: 'b3m1', conversationId: 'b3', role: 'user', content: 'React 18의 Concurrent 주요 기능은?', createdAt: t(87) },
    { id: 'b3m2', conversationId: 'b3', role: 'assistant', content: 'Automatic Batching, useTransition, useDeferredValue', createdAt: t(86) },
  ],
  c6: [
    { id: 'c6m0', conversationId: 'c6', role: 'assistant', content: '배포 설정을 확인해볼게요.', createdAt: t(13) },
    { id: 'c6m1', conversationId: 'c6', role: 'user', content: 'Vite에서 클라이언트 환경 변수는 어떤 이름으로 만들어야 해?', createdAt: t(12) },
    { id: 'c6m2', conversationId: 'c6', role: 'assistant', content: 'VITE_ 접두사가 필요합니다.', createdAt: t(11) },
  ],
  c4: [
    { id: 'c4m0', conversationId: 'c4', role: 'assistant', content: '프론트엔드 에러 처리는 사용자 흐름이 끊기지 않게 설계하는 것이 핵심입니다.', createdAt: t(370) },
    { id: 'c4m1', conversationId: 'c4', role: 'user', content: 'API 요청이 실패했을 때 화면에서는 어떤 상태를 보여줘야 해?', createdAt: t(368) },
    { id: 'c4m2', conversationId: 'c4', role: 'assistant', content: '1. 즉시 피드백\n2. 회복 행동\n3. 원인 단서', createdAt: t(366) },
  ],
  b4: [
    { id: 'b4m0', conversationId: 'b4', role: 'assistant', content: 'API 실패 UX 브랜치입니다.', createdAt: t(364) },
    { id: 'b4m1', conversationId: 'b4', role: 'user', content: '404, 401, 500 에러는 사용자에게 각각 어떻게 말해야 해?', createdAt: t(362) },
    { id: 'b4m2', conversationId: 'b4', role: 'assistant', content: '404: 요청한 내용을 찾을 수 없습니다.\n401: 로그인이 만료되었습니다.\n500: 일시적인 문제가 발생했습니다.', createdAt: t(360) },
  ],
  b5: [
    { id: 'b5m0', conversationId: 'b5', role: 'assistant', content: '폼 검증 케이스 브랜치입니다.', createdAt: t(322) },
    { id: 'b5m1', conversationId: 'b5', role: 'user', content: '회원가입 폼 기준으로 필수 테스트 케이스를 만들어줘.', createdAt: t(320) },
    { id: 'b5m2', conversationId: 'b5', role: 'assistant', content: '이름 미입력 시 안내, 이메일 형식 검사, 비밀번호 8자 이상', createdAt: t(318) },
  ],
  b6: [
    { id: 'b6m0', conversationId: 'b6', role: 'assistant', content: '접근성 점검 브랜치입니다.', createdAt: t(302) },
  ],
  c3: [
    { id: 'c3m0', conversationId: 'c3', role: 'assistant', content: '알고리즘 복잡도를 함께 분석해봅시다.', createdAt: t(1450) },
    { id: 'c3m1', conversationId: 'c3', role: 'user', content: 'O(1), O(log n), O(n), O(n²)를 예시와 함께 설명해줘.', createdAt: t(1449) },
    { id: 'c3m2', conversationId: 'c3', role: 'assistant', content: 'O(1): 해시맵 조회\nO(log n): 이진 탐색\nO(n): 배열 순회\nO(n²): 버블 정렬', createdAt: t(1448) },
  ],
  c5: [
    { id: 'c5m0', conversationId: 'c5', role: 'assistant', content: '데이터베이스 인덱스는 조회 성능과 쓰기 비용 사이의 균형을 잡는 작업입니다.', createdAt: t(4330) },
    { id: 'c5m1', conversationId: 'c5', role: 'user', content: '인덱스는 많을수록 좋은 거 아니야?', createdAt: t(4328) },
    { id: 'c5m2', conversationId: 'c5', role: 'assistant', content: '인덱스가 많으면 쓰기 비용과 저장 공간이 늘어납니다.', createdAt: t(4326) },
  ],
  b7: [
    { id: 'b7m0', conversationId: 'b7', role: 'assistant', content: '쿼리 플랜 해석 브랜치입니다.', createdAt: t(4314) },
    { id: 'b7m1', conversationId: 'b7', role: 'user', content: 'EXPLAIN에서 어떤 항목을 먼저 봐야 해?', createdAt: t(4312) },
    { id: 'b7m2', conversationId: 'b7', role: 'assistant', content: '인덱스 사용 여부, 예상 rows, 정렬/임시 테이블 여부', createdAt: t(4310) },
  ],
  c7: [
    { id: 'c7m0', conversationId: 'c7', role: 'assistant', content: '긴 답변 렌더링을 확인할 수 있는 대화입니다.', createdAt: t(11550) },
    { id: 'c7m1', conversationId: 'c7', role: 'user', content: '프론트엔드 PR 리뷰 체크리스트를 길게 만들어줘.', createdAt: t(11548) },
    { id: 'c7m2', conversationId: 'c7', role: 'assistant', content: '**동작**: 핵심 플로우, 실패 복구\n**UI**: 반응형, 긴 텍스트\n**접근성**: 포커스, 키보드', createdAt: t(11546) },
  ],
  b8: [
    { id: 'b8m0', conversationId: 'b8', role: 'assistant', content: '표 형식 요약 브랜치입니다.', createdAt: t(11544) },
    { id: 'b8m1', conversationId: 'b8', role: 'user', content: '체크리스트를 영역별 표처럼 요약해줘.', createdAt: t(11542) },
    { id: 'b8m2', conversationId: 'b8', role: 'assistant', content: '| 영역 | 확인할 것 |\n| --- | --- |\n| 동작 | 핵심 플로우, 실패 복구 |\n| UI | 반응형, 긴 텍스트 |', createdAt: t(11540) },
  ],
};

export function findBranchInMocks(id: string): boolean {
  return Object.keys(MOCK_MESSAGES).includes(id);
}
