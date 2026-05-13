import React, { useMemo, useState } from 'react';
import type { Conversation, Message } from '../../api/ait';

export type NodeAction =
  | { type: 'scroll'; messageId: string; chatId?: string }
  | { type: 'navigate'; chatId: string };

interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
  isBranch: boolean;
  isRoot: boolean;
  turnIndex?: number;
  chatId?: string;
  groupId?: string;
  messageId?: string;
}

interface GraphEdge {
  from: string;
  to: string;
  groupId?: string;
  toTurnIndex?: number;
}

const ROOT_X = 56;
const ROOT_Y = 40;
const NODE_Y_GAP = 60;
const BRANCH_X_GAP = 92;
const BRANCH_MARKER_Y_GAP = 42;

const getNodeWidth = (node: GraphNode): number =>
  Math.max(34, node.label.length * 6 + 16);

const getUserTurnMessages = (messages: Message[]) =>
  messages.filter(message => !message.isPending && message.role === 'user');

function buildMainNodes(messages: Message[], conv: Conversation | undefined) {
  const nonPending = messages.filter(m => !m.isPending);
  const userTurnMessages = getUserTurnMessages(nonPending);
  const mainNodes: GraphNode[] = [];

  userTurnMessages.forEach((message, index) => {
    const turnNumber = index + 1;
    mainNodes.push({
      id: `n${index}`,
      x: ROOT_X,
      y: ROOT_Y + index * NODE_Y_GAP,
      label: turnNumber === 1 ? 'root' : `T${turnNumber}`,
      isBranch: false,
      isRoot: turnNumber === 1,
      turnIndex: turnNumber,
      chatId: conv?.id,
      groupId: conv?.id,
      messageId: message.id,
    });
  });

  return mainNodes;
}

// root: 첫 AI 멘트 / T_n: n번째 (사용자 질문 + AI 응답) 쌍
function buildGraph(
  messages: Message[],
  conv: Conversation | undefined,
  branchMessagesById: Record<string, Message[]>,
) {
  const branches = conv?.branches ?? [];
  const mainNodes = buildMainNodes(messages, conv);

  const forkNodeIdx = (turnIndex: number): number =>
    Math.max(0, Math.min(turnIndex - 1, mainNodes.length - 1));

  const branchNodes: GraphNode[] = [];
  const branchEdges: GraphEdge[] = [];

  branches.forEach((branch, branchIndex) => {
    if (mainNodes.length === 0) return;

    const branchNumber = branchIndex + 1;
    const forkIndex = forkNodeIdx(branch.forkAtTurnIndex);
    const branchColumnIndex = branches.length - branchIndex;
    const branchX = ROOT_X + BRANCH_X_GAP * branchColumnIndex;
    const branchRootId = `b${branchIndex}-root`;

    branchNodes.push({
      id: branchRootId,
      x: branchX,
      y: ROOT_Y + forkIndex * NODE_Y_GAP + BRANCH_MARKER_Y_GAP,
      label: `B${branchNumber}`,
      isBranch: true,
      isRoot: false,
      chatId: branch.id,
      groupId: branch.id,
    });
    branchEdges.push({ from: `n${forkIndex}`, to: branchRootId, groupId: branch.id });

    const branchTurnMessages = getUserTurnMessages(branchMessagesById[branch.id] ?? []);
    branchTurnMessages.forEach((message, turnIndex) => {
      const turnNumber = turnIndex + 1;
      const nodeId = `b${branchIndex}-t${turnNumber}`;

      branchNodes.push({
        id: nodeId,
        x: branchX,
        y: ROOT_Y + forkIndex * NODE_Y_GAP + BRANCH_MARKER_Y_GAP + turnNumber * NODE_Y_GAP,
        label: `B${branchNumber}-T${turnNumber}`,
        isBranch: false,
        isRoot: false,
        chatId: branch.id,
        groupId: branch.id,
        messageId: message.id,
      });
      branchEdges.push({
        from: turnNumber === 1 ? branchRootId : `b${branchIndex}-t${turnNumber - 1}`,
        to: nodeId,
        groupId: branch.id,
      });
    });
  });

  const mainEdges = mainNodes.slice(0, -1).map((_, i) => ({
    from: `n${i}`,
    to: `n${i + 1}`,
    groupId: conv?.id,
    toTurnIndex: i + 2,
  }));
  const allNodes = [...mainNodes, ...branchNodes];
  const vw = allNodes.reduce((m, n) => Math.max(m, n.x + getNodeWidth(n) / 2 + 24), 160);
  const vh = allNodes.reduce((m, n) => Math.max(m, n.y + 40), 80);

  return { nodes: allNodes, edges: [...mainEdges, ...branchEdges], vw, vh };
}

function nodeFill(n: GraphNode, isSelected: boolean, isInHighlightedPath: boolean): string {
  if (isSelected) return '#be123c';
  if (isInHighlightedPath) return '#0f766e';
  if (n.isBranch) return '#d97706';
  if (n.isRoot) return '#475569';
  return '#1e293b';
}
function nodeStroke(n: GraphNode, isSelected: boolean, isInHighlightedPath: boolean): string {
  if (isSelected) return '#fb7185';
  if (isInHighlightedPath) return '#2dd4bf';
  if (n.isBranch) return '#f59e0b';
  if (n.isRoot) return '#64748b';
  return '#334155';
}
function nodeTextFill(n: GraphNode, isSelected: boolean, isInHighlightedPath: boolean): string {
  if (isSelected || isInHighlightedPath || n.isBranch || n.isRoot) return '#fff';
  return '#94a3b8';
}

interface GraphPanelProps {
  messages: Message[];
  conv: Conversation | undefined;
  branchMessagesById?: Record<string, Message[]>;
  activeId?: string;
  onNodeClick?: (action: NodeAction) => void;
}

const GraphPanel: React.FC<GraphPanelProps> = ({
  messages,
  conv,
  branchMessagesById = {},
  activeId,
  onNodeClick,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const graph = useMemo(
    () => buildGraph(messages, conv, branchMessagesById),
    [messages, conv, branchMessagesById],
  );
  const nodeMap = useMemo(
    () => Object.fromEntries(graph.nodes.map(n => [n.id, n])),
    [graph.nodes],
  );
  const selectedNode = useMemo(
    () => graph.nodes.find(node => node.id === selectedNodeId),
    [graph.nodes, selectedNodeId],
  );
  const activeBranch = useMemo(
    () => conv?.branches.find(branch => branch.id === activeId),
    [conv, activeId],
  );
  const highlightedGroupId = selectedNode?.groupId ?? activeBranch?.id;
  const highlightedBranch = useMemo(
    () => conv?.branches.find(branch => branch.id === highlightedGroupId),
    [conv, highlightedGroupId],
  );

  const isNodeInHighlightedPath = (node: GraphNode): boolean => {
    if (!highlightedGroupId) return false;
    if (node.groupId === highlightedGroupId) return true;
    return !!highlightedBranch
      && node.groupId === conv?.id
      && node.turnIndex !== undefined
      && node.turnIndex <= highlightedBranch.forkAtTurnIndex;
  };

  const isEdgeInHighlightedPath = (edge: GraphEdge): boolean => {
    if (!highlightedGroupId) return false;
    if (edge.groupId === highlightedGroupId) return true;
    return !!highlightedBranch
      && edge.groupId === conv?.id
      && edge.toTurnIndex !== undefined
      && edge.toTurnIndex <= highlightedBranch.forkAtTurnIndex;
  };

  const handleClick = (node: GraphNode) => {
    setSelectedNodeId(node.id);

    if (!onNodeClick) return;
    if (node.messageId) {
      onNodeClick({ type: 'scroll', messageId: node.messageId, chatId: node.chatId });
    } else if (node.chatId) {
      onNodeClick({ type: 'navigate', chatId: node.chatId });
    }
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
        const isHighlighted = isEdgeInHighlightedPath(e);
        return (
          <line
            key={`${e.from}-${e.to}`}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={isHighlighted ? '#2dd4bf' : '#334155'}
            strokeWidth={isHighlighted ? '3' : '2'}
            strokeLinecap="round"
          />
        );
      })}
      {graph.nodes.map(node => {
        const isSelected = node.id === selectedNodeId;
        const isInHighlightedPath = isNodeInHighlightedPath(node) && !isSelected;

        return (
          <g
            key={node.id}
            onClick={() => handleClick(node)}
            style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
          >
            <rect
              x={node.x - getNodeWidth(node) / 2 - 4}
              y={node.y - 18}
              width={getNodeWidth(node) + 8}
              height="36"
              rx="12"
              fill="transparent"
            />
            <rect
              x={node.x - getNodeWidth(node) / 2}
              y={node.y - 14}
              width={getNodeWidth(node)}
              height="28"
              rx="10"
              fill={nodeFill(node, isSelected, isInHighlightedPath)}
              stroke={nodeStroke(node, isSelected, isInHighlightedPath)}
              strokeWidth={isSelected ? '3' : '2'}
            />
            <text
              x={node.x} y={node.y}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fontWeight="700"
              fill={nodeTextFill(node, isSelected, isInHighlightedPath)}
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

export default GraphPanel;
