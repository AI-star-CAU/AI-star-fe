import React, { useMemo, useState } from 'react';
import type { Conversation, Message } from '../../chat/types';
import type { GraphResponse, NodeAction } from '../types';

interface GraphNode {
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
      turnId: message.turnId,
      turnIndex: turnNumber,
      chatId: conv?.id,
      groupId: conv?.id,
    });
  });

  return mainNodes;
}

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
        turnId: message.turnId,
        chatId: branch.id,
        groupId: branch.id,
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

function buildGraphFromApiData(graphData: GraphResponse): ReturnType<typeof buildGraph> {
  const { chats, turns } = graphData;
  if (turns.length === 0) return { nodes: [], edges: [], vw: 160, vh: 80 };

  const rootChat = chats.find(c => c.parentChatId === null);
  if (!rootChat) return { nodes: [], edges: [], vw: 160, vh: 80 };

  // 노드 클릭 시 해당 turn 의 user 메시지(`msg-{id}`)로 스크롤하려면
  // graphData 에 없는 messageId 를 로컬 messages 로부터 turnId 로 역인덱스해 둔다.
  const sortedChats = [...chats].sort((a, b) => a.depth - b.depth || a.chatId - b.chatId);
  const chatColumnMap = new Map<number, number>();
  chatColumnMap.set(rootChat.chatId, 0);
  let nextCol = 1;
  for (const chat of sortedChats) {
    if (chat.chatId !== rootChat.chatId) chatColumnMap.set(chat.chatId, nextCol++);
  }

  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];
  const turnNodeMap = new Map<number, GraphNode>();

  const rootTurns = turns
    .filter(t => t.chatId === rootChat.chatId)
    .sort((a, b) => a.turnSequence - b.turnSequence);

  rootTurns.forEach((turn, i) => {
    const label = turn.summary ? turn.summary.slice(0, 8) : `T${turn.turnSequence}`;
    const node: GraphNode = {
      id: `turn-${turn.turnId}`,
      x: ROOT_X,
      y: ROOT_Y + i * NODE_Y_GAP,
      label: i === 0 ? 'root' : label,
      isBranch: false,
      isRoot: i === 0,
      turnId: turn.turnId,
      turnIndex: turn.turnSequence,
      chatId: String(turn.chatId),
      groupId: String(turn.chatId),
    };
    nodes.push(node);
    turnNodeMap.set(turn.turnId, node);
    if (i > 0) {
      edges.push({
        from: `turn-${rootTurns[i - 1].turnId}`,
        to: node.id,
        groupId: String(turn.chatId),
        toTurnIndex: turn.turnSequence,
      });
    }
  });

  for (const chat of sortedChats) {
    if (chat.chatId === rootChat.chatId) continue;
    const col = chatColumnMap.get(chat.chatId) ?? 1;
    const branchX = ROOT_X + BRANCH_X_GAP * col;
    const branchPointNode = chat.branchPointTurnId ? turnNodeMap.get(chat.branchPointTurnId) : null;
    const startY = branchPointNode ? branchPointNode.y + BRANCH_MARKER_Y_GAP : ROOT_Y;

    const markerId = `branch-marker-${chat.chatId}`;
    nodes.push({
      id: markerId,
      x: branchX,
      y: startY,
      label: `B${col}`,
      isBranch: true,
      isRoot: false,
      chatId: String(chat.chatId),
      groupId: String(chat.chatId),
      isDeleted: chat.isDeleted,
    });
    if (branchPointNode) {
      edges.push({ from: branchPointNode.id, to: markerId, groupId: String(chat.chatId) });
    }

    const branchTurns = turns
      .filter(t => t.chatId === chat.chatId)
      .sort((a, b) => a.turnSequence - b.turnSequence);

    branchTurns.forEach((turn, i) => {
      const label = turn.summary ? turn.summary.slice(0, 8) : `T${turn.turnSequence}`;
      const node: GraphNode = {
        id: `turn-${turn.turnId}`,
        x: branchX,
        y: startY + (i + 1) * NODE_Y_GAP,
        label,
        isBranch: false,
        isRoot: false,
        turnId: turn.turnId,
        turnIndex: turn.turnSequence,
        chatId: String(turn.chatId),
        groupId: String(turn.chatId),
      };
      nodes.push(node);
      turnNodeMap.set(turn.turnId, node);
      const prevId = i === 0 ? markerId : `turn-${branchTurns[i - 1].turnId}`;
      edges.push({ from: prevId, to: node.id, groupId: String(turn.chatId) });
    });
  }

  const vw = nodes.reduce((m, n) => Math.max(m, n.x + getNodeWidth(n) / 2 + 24), 160);
  const vh = nodes.reduce((m, n) => Math.max(m, n.y + 40), 80);
  return { nodes, edges, vw, vh };
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
  graphData?: GraphResponse;
  onExpand?: (fromTurnId: number, direction: 'UP' | 'DOWN') => void;
  onRestore?: (chatId: string) => void;
}

const GraphPanel: React.FC<GraphPanelProps> = ({
  messages,
  conv,
  branchMessagesById = {},
  activeId,
  onNodeClick,
  graphData,
  onExpand,
  onRestore,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const graph = useMemo(
    () => graphData && graphData.turns.length > 0
      ? buildGraphFromApiData(graphData)
      : buildGraph(messages, conv, branchMessagesById),
    [graphData, messages, conv, branchMessagesById],
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
  const highlightedGroupId = selectedNode?.groupId ?? activeBranch?.id ?? activeId;
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
    if (node.turnId != null && node.chatId) {
      onNodeClick({
        type: 'turn',
        turnId: node.turnId,
        chatId: node.chatId,
        turnSequence: node.turnIndex,
      });
    } else if (node.chatId) {
      onNodeClick({ type: 'navigate', chatId: node.chatId });
    }
  };

  const upFrontier = graphData?.frontier.up.filter(f => f.hasMore) ?? [];
  const downFrontier = graphData?.frontier.down.filter(f => f.hasMore) ?? [];
  const extraHeight = (upFrontier.length > 0 ? 32 : 0) + (downFrontier.length > 0 ? 32 : 0);
  const totalVh = graph.vh + extraHeight;

  return (
    <svg
      width={graph.vw}
      height={totalVh}
      viewBox={`0 0 ${graph.vw} ${totalVh}`}
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
      {upFrontier.map(f => (
        <g key={`up-${f.fromTurnId}`} onClick={() => onExpand?.(f.fromTurnId, 'UP')} style={{ cursor: 'pointer' }}>
          <rect x={ROOT_X - 28} y={4} width={56} height={20} rx={10} fill="#1e293b" stroke="#334155" strokeWidth={1} />
          <text x={ROOT_X} y={14} textAnchor="middle" dominantBaseline="middle" fontSize={9} fontWeight={700} fill="#94a3b8">
            ▲ 더 보기
          </text>
        </g>
      ))}

      {graph.nodes.map(node => {
        const isSelected = node.id === selectedNodeId;
        const isInHighlightedPath = isNodeInHighlightedPath(node) && !isSelected;

        if (node.isDeleted) {
          return (
            <g key={node.id} style={{ cursor: onRestore ? 'pointer' : 'default' }}
              onClick={() => node.chatId && onRestore?.(node.chatId)}>
              <rect
                x={node.x - getNodeWidth(node) / 2}
                y={node.y - 14}
                width={getNodeWidth(node)}
                height="28"
                rx="10"
                fill="#0f172a"
                stroke="#475569"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="middle"
                fontSize="9" fontWeight="700" fill="#475569">
                {node.label}
              </text>
              <text x={node.x} y={node.y + 16} textAnchor="middle" dominantBaseline="middle"
                fontSize="8" fill="#64748b">
                복구
              </text>
            </g>
          );
        }

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
      {downFrontier.map(f => (
        <g key={`down-${f.fromTurnId}`} onClick={() => onExpand?.(f.fromTurnId, 'DOWN')} style={{ cursor: 'pointer' }}>
          <rect x={ROOT_X - 28} y={graph.vh + 4} width={56} height={20} rx={10} fill="#1e293b" stroke="#334155" strokeWidth={1} />
          <text x={ROOT_X} y={graph.vh + 14} textAnchor="middle" dominantBaseline="middle" fontSize={9} fontWeight={700} fill="#94a3b8">
            ▼ 더 보기
          </text>
        </g>
      ))}
    </svg>
  );
};

export default GraphPanel;
