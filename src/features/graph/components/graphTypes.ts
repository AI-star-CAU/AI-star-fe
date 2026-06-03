import type { SummaryStatus } from '../types';

/** 그래프 렌더링용 내부 노드 모델 (SVG 좌표 포함). */
export interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
  isBranch: boolean;
  isRoot: boolean;
  turnId?: number;
  turnIndex?: number;
  chatId?: string;
  groupId?: string;
  isDeleted?: boolean;
  summary?: string | null;
  summaryStatus?: SummaryStatus;
  /** 대화 보기에서 시간순 정렬에 사용. ISO 8601. */
  createdAt?: string;
  /** 대화 보기 들여쓰기에 쓰는 트리 깊이. root chat = 0. */
  depth?: number;
}

/** 그래프 렌더링용 내부 엣지 모델. */
export interface GraphEdge {
  from: string;
  to: string;
  groupId?: string;
  toTurnIndex?: number;
}

/** 그래프 빌더/레이아웃 함수가 공통으로 반환하는 형태. */
export interface BuiltGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  vw: number;
  vh: number;
}
