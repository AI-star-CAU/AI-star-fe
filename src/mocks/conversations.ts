import type { Conversation } from '../features/chat/types';

export const MOCK_CONVERSATIONS: Conversation[] = [
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
    id: 'c6',
    title: '짧은 QA: 배포 환경 변수',
    preview: 'Vite 환경 변수 이름 규칙과 Netlify 설정...',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    turnCount: 1,
    branches: [],
  },
  {
    id: 'c4',
    title: '프론트엔드 에러 처리 전략',
    preview: 'API 실패, 빈 상태, 재시도, 폼 검증 케이스...',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    turnCount: 5,
    branches: [
      { id: 'b4', parentConvId: 'c4', title: 'API 실패 UX', forkAtTurnIndex: 1 },
      { id: 'b5', parentConvId: 'c4', title: '폼 검증 케이스', forkAtTurnIndex: 4 },
      { id: 'b6', parentConvId: 'c4', title: '접근성 점검', forkAtTurnIndex: 5 },
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
  {
    id: 'c5',
    title: '데이터베이스 인덱스 설계',
    preview: '복합 인덱스와 쿼리 플랜을 어떻게 읽을까...',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    turnCount: 3,
    branches: [
      { id: 'b7', parentConvId: 'c5', title: '쿼리 플랜 해석', forkAtTurnIndex: 2 },
    ],
  },
  {
    id: 'c7',
    title: '긴 답변 렌더링 테스트',
    preview: '마크다운 목록, 코드블록, 긴 문단 표시 확인...',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    turnCount: 2,
    branches: [
      { id: 'b8', parentConvId: 'c7', title: '표 형식 요약', forkAtTurnIndex: 1 },
    ],
  },
];
