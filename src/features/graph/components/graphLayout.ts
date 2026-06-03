import type { GraphNode, GraphEdge, BuiltGraph } from './graphTypes';
import {
  FOCUSED_ROOT_X,
  FOCUSED_ROOT_Y,
  FOCUSED_NODE_Y_GAP,
  FOCUSED_INDENT,
  FOCUSED_SUMMARY_X,
  FOCUSED_SUMMARY_WIDTH,
  FOCUSED_SUMMARY_MIN_HEIGHT,
  FOCUSED_SUMMARY_LINE_HEIGHT,
  FOCUSED_SUMMARY_MAX_LINES,
  SUMMARY_PENDING_TEXT,
  SUMMARY_EMPTY_TEXT,
} from './graphConstants';
import { cleanSummaryText } from './graphBuilders';

export const getFocusedSummaryText = (node: GraphNode): string => {
  if (node.summaryStatus === 'PENDING') return SUMMARY_PENDING_TEXT;
  const summary = cleanSummaryText(node.summary);
  if (summary) return summary;
  if (node.isBranch) return node.isDeleted ? '삭제된 분기입니다. 클릭하면 복구됩니다.' : '분기 시작';
  return SUMMARY_EMPTY_TEXT;
};

export const splitSummaryLines = (
  text: string,
  maxChars = 24,
  maxLines = FOCUSED_SUMMARY_MAX_LINES,
): string[] => {
  const words = cleanSummaryText(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  const pushLine = (line: string) => {
    if (line) lines.push(line);
  };

  words.forEach(word => {
    if (word.length > maxChars) {
      pushLine(current);
      current = '';
      for (let i = 0; i < word.length; i += maxChars) {
        lines.push(word.slice(i, i + maxChars));
      }
      return;
    }

    if (!current) {
      current = word;
      return;
    }

    if (`${current} ${word}`.length <= maxChars) {
      current = `${current} ${word}`;
    } else {
      pushLine(current);
      current = word;
    }
  });

  pushLine(current);

  if (lines.length === 0) return [SUMMARY_EMPTY_TEXT];
  if (lines.length <= maxLines) return lines;

  const clipped = lines.slice(0, maxLines);
  const last = clipped[maxLines - 1];
  clipped[maxLines - 1] = last.length > maxChars - 3
    ? `${last.slice(0, Math.max(0, maxChars - 3))}...`
    : `${last}...`;
  return clipped;
};

/**
 * 대화 보기 레이아웃.
 *
 * 정책 (사용자 요구):
 *  - 모든 노드를 항상 보여준다 (다른 분기를 클릭해도 접히지 않음).
 *  - 시간순(createdAt ASC)으로 위→아래 정렬. 가장 늦은 것이 맨 아래.
 *  - 엣지는 시간순 정렬 때문에 겹쳐도 무방.
 *  - x 는 분기 깊이만큼 살짝 들여써서 같은 chat 끼리 한 lane 으로 보이게 한다.
 */
export function buildFocusedGraph(nodes: GraphNode[], edges: GraphEdge[]): BuiltGraph {
  const sortedNodes = [...nodes].sort((a, b) => {
    const ac = a.createdAt ?? '';
    const bc = b.createdAt ?? '';
    if (ac !== bc) return ac < bc ? -1 : 1;
    // 동시각 (분기 marker + 같은 createdAt 의 turn): 부모(낮은 depth) → 자식 순
    const ad = a.depth ?? 0;
    const bd = b.depth ?? 0;
    if (ad !== bd) return ad - bd;
    // 마지막 tiebreaker: 안정적 순서를 위해 id 비교
    return a.id.localeCompare(b.id, undefined, { numeric: true });
  });
  const focusedNodes = sortedNodes.map((node, index) => ({
    ...node,
    x: FOCUSED_ROOT_X + (node.depth ?? 0) * FOCUSED_INDENT,
    y: FOCUSED_ROOT_Y + index * FOCUSED_NODE_Y_GAP,
  }));
  const visibleNodeIds = new Set(focusedNodes.map(node => node.id));
  const focusedEdges = edges.filter(
    edge => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to),
  );
  const vw = Math.max(
    FOCUSED_SUMMARY_X + FOCUSED_SUMMARY_WIDTH + 24,
    focusedNodes.reduce((max, node) => Math.max(max, node.x + FOCUSED_SUMMARY_WIDTH + 32), 0),
  );
  const vh = focusedNodes.reduce((max, node) => Math.max(max, node.y + 46), 84);

  return {
    nodes: focusedNodes,
    edges: focusedEdges,
    vw,
    vh,
  };
}

export function getSummaryCardHeight(lines: string[]): number {
  return Math.max(
    FOCUSED_SUMMARY_MIN_HEIGHT,
    lines.length * FOCUSED_SUMMARY_LINE_HEIGHT + 18,
  );
}
