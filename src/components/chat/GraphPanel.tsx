import React, { useMemo } from 'react';
import type { Conversation, Message } from '../../api/ait';

export type NodeAction =
  | { type: 'scroll'; messageId: string }
  | { type: 'navigate'; branchId: string };

interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
  isCurrent: boolean;
  isBranch: boolean;
  isRoot: boolean;
  messageId?: string;
  branchId?: string;
}

// root: 첫 AI 멘트 / T_n: n번째 (사용자 질문 + AI 응답) 쌍
function buildGraph(messages: Message[], conv: Conversation | undefined) {
  const nonPending = messages.filter(m => !m.isPending);
  const branches = conv?.branches ?? [];

  const mainNodes: GraphNode[] = [];

  if (nonPending.length > 0) {
    mainNodes.push({
      id: 'n0',
      x: 56,
      y: 40,
      label: 'root',
      isCurrent: false,
      isBranch: false,
      isRoot: true,
      messageId: nonPending[0].id,
    });
  }

  let turnIdx = 0;
  for (let i = 1; i < nonPending.length; i++) {
    if (nonPending[i].role === 'user') {
      turnIdx++;
      mainNodes.push({
        id: `n${turnIdx}`,
        x: 56,
        y: 40 + turnIdx * 60,
        label: `T${turnIdx}`,
        isCurrent: false,
        isBranch: false,
        isRoot: false,
        messageId: nonPending[i].id,
      });
    }
  }

  if (mainNodes.length > 0) {
    mainNodes[mainNodes.length - 1].isCurrent = true;
  }

  const forkNodeIdx = (turnIndex: number): number =>
    Math.min(turnIndex, mainNodes.length - 1);

  const branchNodes: GraphNode[] = branches.flatMap((b, bi) => {
    const fi = forkNodeIdx(b.forkAtTurnIndex);
    return [
      {
        id: `b${bi}a`, x: 136, y: 40 + fi * 60,
        label: `B${bi + 1}`, isCurrent: false, isBranch: true, isRoot: false,
        branchId: b.id,
      },
      {
        id: `b${bi}b`, x: 136, y: 40 + (fi + 1) * 60,
        label: '···', isCurrent: false, isBranch: false, isRoot: false,
        branchId: b.id,
      },
    ];
  });

  const mainEdges = mainNodes.slice(0, -1).map((_, i) => ({ from: `n${i}`, to: `n${i + 1}` }));
  const branchEdges = branches.flatMap((b, bi) => {
    const fi = forkNodeIdx(b.forkAtTurnIndex);
    return [
      { from: `n${fi}`, to: `b${bi}a` },
      { from: `b${bi}a`, to: `b${bi}b` },
    ];
  });

  const allNodes = [...mainNodes, ...branchNodes];
  const vw = allNodes.reduce((m, n) => Math.max(m, n.x + 56), 0);
  const vh = allNodes.reduce((m, n) => Math.max(m, n.y + 40), 0);

  return { nodes: allNodes, edges: [...mainEdges, ...branchEdges], vw, vh };
}

function nodeFill(n: GraphNode): string {
  if (n.isCurrent) return '#0891b2';
  if (n.isBranch) return '#d97706';
  if (n.isRoot) return '#475569';
  return '#1e293b';
}
function nodeStroke(n: GraphNode): string {
  if (n.isCurrent) return '#22d3ee';
  if (n.isBranch) return '#f59e0b';
  if (n.isRoot) return '#64748b';
  return '#334155';
}
function nodeTextFill(n: GraphNode): string {
  if (n.isCurrent || n.isBranch || n.isRoot) return '#fff';
  return '#94a3b8';
}

interface GraphPanelProps {
  messages: Message[];
  conv: Conversation | undefined;
  onNodeClick?: (action: NodeAction) => void;
}

const GraphPanel: React.FC<GraphPanelProps> = ({ messages, conv, onNodeClick }) => {
  const graph = useMemo(() => buildGraph(messages, conv), [messages, conv]);
  const nodeMap = useMemo(
    () => Object.fromEntries(graph.nodes.map(n => [n.id, n])),
    [graph.nodes],
  );

  const handleClick = (node: GraphNode) => {
    if (!onNodeClick) return;
    if (node.messageId) onNodeClick({ type: 'scroll', messageId: node.messageId });
    else if (node.branchId) onNodeClick({ type: 'navigate', branchId: node.branchId });
  };

  return (
    <svg
      width={graph.vw}
      height={graph.vh}
      viewBox={`0 0 ${graph.vw} ${graph.vh}`}
      className="block flex-shrink-0"
    >
      {graph.edges.map(e => {
        const a = nodeMap[e.from];
        const b = nodeMap[e.to];
        if (!a || !b) return null;
        return (
          <line
            key={`${e.from}-${e.to}`}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke="#334155" strokeWidth="2" strokeLinecap="round"
          />
        );
      })}
      {graph.nodes.map(node => (
        <g
          key={node.id}
          onClick={() => handleClick(node)}
          style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
        >
          <circle cx={node.x} cy={node.y} r="22" fill="transparent" />
          <circle
            cx={node.x} cy={node.y} r="16"
            fill={nodeFill(node)}
            stroke={nodeStroke(node)}
            strokeWidth="2"
          />
          <text
            x={node.x} y={node.y}
            textAnchor="middle" dominantBaseline="middle"
            fontSize="9" fontWeight="700"
            fill={nodeTextFill(node)}
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

export default GraphPanel;
