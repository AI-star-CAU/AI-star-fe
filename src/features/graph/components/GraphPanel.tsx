import React, { useMemo, useState } from 'react';
import type { Conversation, Message } from '../../chat/types';
import type { GraphResponse, GraphViewMode, NodeAction, SummaryStatus } from '../types';

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
  summary?: string | null;
  summaryStatus?: SummaryStatus;
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
const FOCUSED_ROOT_X = 46;
const FOCUSED_ROOT_Y = 42;
const FOCUSED_NODE_Y_GAP = 78;
const FOCUSED_SUMMARY_X = 86;
const FOCUSED_SUMMARY_WIDTH = 226;
const FOCUSED_SUMMARY_MIN_HEIGHT = 42;
const FOCUSED_SUMMARY_LINE_HEIGHT = 12;
const FOCUSED_SUMMARY_MAX_LINES = 3;
const SUMMARY_PENDING_TEXT = '요약 생성 중...';
const SUMMARY_EMPTY_TEXT = '요약이 아직 없습니다.';

const GRAPH_NODE_COLORS = {
  selected: {
    fill: '#A03028',
    stroke: '#7E2018',
    text: '#F4ECD8',
  },
  highlighted: {
    fill: '#A88A3F',
    stroke: '#7E2018',
    text: '#181410',
  },
  branch: {
    fill: '#FAF4E2',
    stroke: '#A03028',
    text: '#7E2018',
  },
  root: {
    fill: '#181410',
    stroke: '#181410',
    text: '#F4ECD8',
  },
  default: {
    fill: '#FAF4E2',
    stroke: '#2A211B',
    text: '#181410',
  },
  deleted: {
    fill: '#E7DCC0',
    stroke: '#867159',
    text: '#867159',
    subtext: '#7E2018',
  },
  edge: {
    default: '#867159',
    highlighted: '#7E2018',
  },
} as const;

const getNodeWidth = (node: GraphNode): number =>
  Math.max(34, node.label.length * 6 + 16);

const getUserTurnMessages = (messages: Message[]) =>
  messages.filter(message => !message.isPending && message.role === 'user');

const numericId = (id: string): number => {
  const parsed = Number(id);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
};

const cleanSummaryText = (value: string | null | undefined): string =>
  value?.replace(/\s+/g, ' ').trim() ?? '';

const getMessageSummary = (message: Message): string => cleanSummaryText(message.content);

const getTurnLabel = (turnSequence: number, summary: string | null, status: SummaryStatus): string => {
  if (turnSequence === 1) return 'root';
  const cleanSummary = cleanSummaryText(summary);
  if (!cleanSummary || status === 'PENDING') return `T${turnSequence}`;
  return cleanSummary.slice(0, 8);
};

const getFocusedSummaryText = (node: GraphNode): string => {
  if (node.summaryStatus === 'PENDING') return SUMMARY_PENDING_TEXT;
  const summary = cleanSummaryText(node.summary);
  if (summary) return summary;
  if (node.isBranch) return node.isDeleted ? '삭제된 분기입니다. 클릭하면 복구됩니다.' : '분기 시작';
  return SUMMARY_EMPTY_TEXT;
};

const splitSummaryLines = (
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

function getBranchDepth(
  branchId: string,
  branchById: Map<string, NonNullable<Conversation['branches']>[number]>,
  rootId: string | undefined,
): number {
  const branch = branchById.get(branchId);
  if (!branch) return 1;
  if (branch.depth != null) return branch.depth;
  if (!rootId || branch.parentConvId === rootId) return 1;
  return getBranchDepth(branch.parentConvId, branchById, rootId) + 1;
}

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
      summary: getMessageSummary(message),
      summaryStatus: 'GENERATED',
    });
  });

  return mainNodes;
}

function buildGraph(
  messages: Message[],
  conv: Conversation | undefined,
  branchMessagesById: Record<string, Message[]>,
) {
  const branchById = new Map((conv?.branches ?? []).map(branch => [branch.id, branch]));
  const branches = [...(conv?.branches ?? [])].sort((a, b) => {
    const depthDiff = getBranchDepth(a.id, branchById, conv?.id)
      - getBranchDepth(b.id, branchById, conv?.id);
    return depthDiff || numericId(a.id) - numericId(b.id);
  });
  const mainNodes = buildMainNodes(messages, conv);
  const mainEdges = mainNodes.slice(0, -1).map((_, i) => ({
    from: `n${i}`,
    to: `n${i + 1}`,
    groupId: conv?.id,
    toTurnIndex: i + 2,
  }));

  const branchNodes: GraphNode[] = [];
  const branchEdges: GraphEdge[] = [];
  const turnNodeByTurnId = new Map<number, GraphNode>();
  const firstNodeByChatId = new Map<string, GraphNode>();
  const chatStartY = new Map<string, number>();

  mainNodes.forEach(node => {
    if (node.turnId != null) turnNodeByTurnId.set(node.turnId, node);
    if (node.chatId && !firstNodeByChatId.has(node.chatId)) {
      firstNodeByChatId.set(node.chatId, node);
      chatStartY.set(node.chatId, ROOT_Y);
    }
  });

  branches.forEach((branch, branchIndex) => {
    const branchNumber = branchIndex + 1;
    const branchX = ROOT_X + BRANCH_X_GAP * branchNumber;
    const fallbackParentNode = firstNodeByChatId.get(branch.parentConvId) ?? mainNodes[0];
    const fallbackForkIndex = Math.max(1, branch.forkAtTurnIndex || 1);
    const fallbackForkY = (chatStartY.get(branch.parentConvId) ?? ROOT_Y)
      + (fallbackForkIndex - 1) * NODE_Y_GAP;
    const branchPointNode = branch.branchPointTurnId != null
      ? turnNodeByTurnId.get(branch.branchPointTurnId)
      : undefined;
    const markerY = (branchPointNode?.y ?? fallbackParentNode?.y ?? fallbackForkY)
      + BRANCH_MARKER_Y_GAP;
    const markerId = `branch-marker-${branch.id}`;

    branchNodes.push({
      id: markerId,
      x: branchX,
      y: markerY,
      label: `B${branchNumber}`,
      isBranch: true,
      isRoot: false,
      chatId: branch.id,
      groupId: branch.id,
      summary: branch.title,
      summaryStatus: 'GENERATED',
    });
    chatStartY.set(branch.id, markerY);

    const edgeFrom = branchPointNode?.id ?? fallbackParentNode?.id;
    if (edgeFrom) {
      branchEdges.push({ from: edgeFrom, to: markerId, groupId: branch.id });
    }

    const branchTurnMessages = getUserTurnMessages(branchMessagesById[branch.id] ?? []);
    branchTurnMessages.forEach((message, turnIndex) => {
      const turnNumber = turnIndex + 1;
      const nodeId = `branch-${branch.id}-turn-${turnNumber}`;
      const node: GraphNode = {
        id: nodeId,
        x: branchX,
        y: markerY + turnNumber * NODE_Y_GAP,
        label: `B${branchNumber}-T${turnNumber}`,
        isBranch: false,
        isRoot: false,
        turnId: message.turnId,
        turnIndex: turnNumber,
        chatId: branch.id,
        groupId: branch.id,
        summary: getMessageSummary(message),
        summaryStatus: 'GENERATED',
      };

      branchNodes.push(node);
      if (message.turnId != null) turnNodeByTurnId.set(message.turnId, node);
      if (!firstNodeByChatId.has(branch.id)) firstNodeByChatId.set(branch.id, node);
      branchEdges.push({
        from: turnNumber === 1 ? markerId : `branch-${branch.id}-turn-${turnNumber - 1}`,
        to: nodeId,
        groupId: branch.id,
      });
    });
  });

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
    const label = getTurnLabel(turn.turnSequence, turn.summary, turn.summaryStatus);
    const node: GraphNode = {
      id: `turn-${turn.turnId}`,
      x: ROOT_X,
      y: ROOT_Y + (turn.turnSequence - 1) * NODE_Y_GAP,
      label,
      isBranch: false,
      isRoot: turn.turnSequence === 1,
      turnId: turn.turnId,
      turnIndex: turn.turnSequence,
      chatId: String(turn.chatId),
      groupId: String(turn.chatId),
      summary: turn.summary,
      summaryStatus: turn.summaryStatus,
    };
    nodes.push(node);
    turnNodeMap.set(turn.turnId, node);
    if (
      i > 0 &&
      rootTurns[i - 1].turnSequence === turn.turnSequence - 1
    ) {
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
      summary: chat.title,
      summaryStatus: chat.titleStatus === 'PENDING' ? 'PENDING' : 'GENERATED',
    });
    if (branchPointNode) {
      edges.push({ from: branchPointNode.id, to: markerId, groupId: String(chat.chatId) });
    }

    const branchTurns = turns
      .filter(t => t.chatId === chat.chatId)
      .sort((a, b) => a.turnSequence - b.turnSequence);

    branchTurns.forEach((turn, i) => {
      const label = getTurnLabel(turn.turnSequence, turn.summary, turn.summaryStatus);
      const node: GraphNode = {
        id: `turn-${turn.turnId}`,
        x: branchX,
        y: startY + turn.turnSequence * NODE_Y_GAP,
        label,
        isBranch: false,
        isRoot: false,
        turnId: turn.turnId,
        turnIndex: turn.turnSequence,
        chatId: String(turn.chatId),
        groupId: String(turn.chatId),
        summary: turn.summary,
        summaryStatus: turn.summaryStatus,
      };
      nodes.push(node);
      turnNodeMap.set(turn.turnId, node);
      if (turn.turnSequence === 1) {
        edges.push({ from: markerId, to: node.id, groupId: String(turn.chatId) });
      } else if (
        i > 0 &&
        branchTurns[i - 1].turnSequence === turn.turnSequence - 1
      ) {
        edges.push({
          from: `turn-${branchTurns[i - 1].turnId}`,
          to: node.id,
          groupId: String(turn.chatId),
        });
      }
    });
  }

  const vw = nodes.reduce((m, n) => Math.max(m, n.x + getNodeWidth(n) / 2 + 24), 160);
  const vh = nodes.reduce((m, n) => Math.max(m, n.y + 40), 80);
  return { nodes, edges, vw, vh };
}

// 신문 분기 지도(map-canvas) 팔레트 — 시안 .mnode 패턴
// root: 잉크 채움 / active(selected): 빨강 채움 / branch: 페이퍼 + 빨강 보더
// hover path: 골드 강조 / 일반 turn: 페이퍼 + 잉크 보더
function nodeFill(n: GraphNode, isSelected: boolean, isInHighlightedPath: boolean): string {
  if (isSelected) return GRAPH_NODE_COLORS.selected.fill;
  if (isInHighlightedPath) return GRAPH_NODE_COLORS.highlighted.fill;
  if (n.isBranch) return GRAPH_NODE_COLORS.branch.fill;
  if (n.isRoot) return GRAPH_NODE_COLORS.root.fill;
  return GRAPH_NODE_COLORS.default.fill;
}
function nodeStroke(n: GraphNode, isSelected: boolean, isInHighlightedPath: boolean): string {
  if (isSelected) return GRAPH_NODE_COLORS.selected.stroke;
  if (isInHighlightedPath) return GRAPH_NODE_COLORS.highlighted.stroke;
  if (n.isBranch) return GRAPH_NODE_COLORS.branch.stroke;
  if (n.isRoot) return GRAPH_NODE_COLORS.root.stroke;
  return GRAPH_NODE_COLORS.default.stroke;
}
function nodeTextFill(n: GraphNode, isSelected: boolean, isInHighlightedPath: boolean): string {
  if (isSelected) return GRAPH_NODE_COLORS.selected.text;
  if (isInHighlightedPath) return GRAPH_NODE_COLORS.highlighted.text;
  if (n.isBranch) return GRAPH_NODE_COLORS.branch.text;
  if (n.isRoot) return GRAPH_NODE_COLORS.root.text;
  return GRAPH_NODE_COLORS.default.text;
}

function buildFocusedGraph(nodes: GraphNode[], edges: GraphEdge[]): ReturnType<typeof buildGraph> {
  const sortedNodes = [...nodes].sort(
    (a, b) => a.y - b.y || a.x - b.x || a.id.localeCompare(b.id, undefined, { numeric: true }),
  );
  const focusedNodes = sortedNodes.map((node, index) => ({
    ...node,
    x: FOCUSED_ROOT_X,
    y: FOCUSED_ROOT_Y + index * FOCUSED_NODE_Y_GAP,
  }));
  const visibleNodeIds = new Set(focusedNodes.map(node => node.id));
  const focusedEdges = edges.filter(
    edge => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to),
  );
  const vh = focusedNodes.reduce((max, node) => Math.max(max, node.y + 46), 84);

  return {
    nodes: focusedNodes,
    edges: focusedEdges,
    vw: FOCUSED_SUMMARY_X + FOCUSED_SUMMARY_WIDTH + 24,
    vh,
  };
}

function getSummaryCardHeight(lines: string[]): number {
  return Math.max(
    FOCUSED_SUMMARY_MIN_HEIGHT,
    lines.length * FOCUSED_SUMMARY_LINE_HEIGHT + 18,
  );
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
  zoom?: number;
  viewMode?: GraphViewMode;
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
  zoom = 1,
  viewMode = 'structure',
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const graph = useMemo(
    () => graphData && graphData.turns.length > 0
      ? buildGraphFromApiData(graphData)
      : buildGraph(messages, conv, branchMessagesById),
    [graphData, messages, conv, branchMessagesById],
  );
  const sourceNodeMap = useMemo(
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
  const apiHighlightPath = useMemo(() => {
    if (!graphData || !highlightedGroupId) return null;

    const highlightedChatId = Number(highlightedGroupId);
    if (!Number.isFinite(highlightedChatId)) return null;

    const chatsById = new Map(graphData.chats.map(chat => [chat.chatId, chat]));
    let chat = chatsById.get(highlightedChatId);
    if (!chat) return null;

    const chatIds = new Set<number>();
    const cutoffSequenceByChatId = new Map<number, number>();

    while (chat) {
      chatIds.add(chat.chatId);

      if (chat.parentChatId != null && chat.branchPointTurnId != null) {
        const branchPointTurnId = chat.branchPointTurnId;
        const branchPointTurn = graphData.turns.find(
          turn => turn.turnId === branchPointTurnId,
        );
        if (branchPointTurn) {
          cutoffSequenceByChatId.set(
            chat.parentChatId,
            branchPointTurn.turnSequence,
          );
        }
      }

      chat = chat.parentChatId == null ? undefined : chatsById.get(chat.parentChatId);
    }

    return { chatIds, cutoffSequenceByChatId };
  }, [graphData, highlightedGroupId]);
  const localHighlightPath = useMemo(() => {
    if (!conv || !highlightedGroupId) return null;

    if (highlightedGroupId === conv.id) {
      return {
        chatIds: new Set([conv.id]),
        cutoffTurnIndexByChatId: new Map<string, number>(),
      };
    }

    const branchById = new Map(conv.branches.map(branch => [branch.id, branch]));
    let branch = branchById.get(highlightedGroupId);
    if (!branch) return null;

    const chatIds = new Set<string>();
    const cutoffTurnIndexByChatId = new Map<string, number>();

    while (branch) {
      chatIds.add(branch.id);
      cutoffTurnIndexByChatId.set(branch.parentConvId, branch.forkAtTurnIndex);

      if (branch.parentConvId === conv.id) {
        chatIds.add(conv.id);
        break;
      }

      branch = branchById.get(branch.parentConvId);
    }

    return { chatIds, cutoffTurnIndexByChatId };
  }, [conv, highlightedGroupId]);

  const isNodeInHighlightedPath = (node: GraphNode): boolean => {
    if (!highlightedGroupId) return false;
    if (node.isRoot) return true;
    if (apiHighlightPath && node.groupId) {
      const nodeChatId = Number(node.groupId);
      if (!Number.isFinite(nodeChatId) || !apiHighlightPath.chatIds.has(nodeChatId)) {
        return false;
      }
      const cutoffSequence = apiHighlightPath.cutoffSequenceByChatId.get(nodeChatId);
      return cutoffSequence === undefined
        || node.isBranch
        || (node.turnIndex !== undefined && node.turnIndex <= cutoffSequence);
    }
    if (localHighlightPath && node.groupId) {
      if (!localHighlightPath.chatIds.has(node.groupId)) return false;
      const cutoffTurnIndex = localHighlightPath.cutoffTurnIndexByChatId.get(node.groupId);
      return cutoffTurnIndex === undefined
        || node.isBranch
        || (node.turnIndex !== undefined && node.turnIndex <= cutoffTurnIndex);
    }
    if (node.groupId === highlightedGroupId) return true;
    return !!highlightedBranch
      && node.groupId === conv?.id
      && node.turnIndex !== undefined
      && node.turnIndex <= highlightedBranch.forkAtTurnIndex;
  };

  const isEdgeInHighlightedPath = (edge: GraphEdge): boolean => {
    if (!highlightedGroupId) return false;
    if (apiHighlightPath && edge.groupId) {
      const edgeChatId = Number(edge.groupId);
      if (!Number.isFinite(edgeChatId) || !apiHighlightPath.chatIds.has(edgeChatId)) {
        return false;
      }
      const cutoffSequence = apiHighlightPath.cutoffSequenceByChatId.get(edgeChatId);
      const toNode = sourceNodeMap[edge.to];
      return cutoffSequence === undefined
        || toNode?.isBranch
        || (toNode?.turnIndex !== undefined && toNode.turnIndex <= cutoffSequence);
    }
    if (localHighlightPath && edge.groupId) {
      if (!localHighlightPath.chatIds.has(edge.groupId)) return false;
      const cutoffTurnIndex = localHighlightPath.cutoffTurnIndexByChatId.get(edge.groupId);
      const toNode = sourceNodeMap[edge.to];
      return cutoffTurnIndex === undefined
        || toNode?.isBranch
        || (toNode?.turnIndex !== undefined && toNode.turnIndex <= cutoffTurnIndex);
    }
    if (edge.groupId === highlightedGroupId) return true;
    return !!highlightedBranch
      && edge.groupId === conv?.id
      && edge.toTurnIndex !== undefined
      && edge.toTurnIndex <= highlightedBranch.forkAtTurnIndex;
  };

  const hasHighlight = highlightedGroupId !== undefined && highlightedGroupId !== null;
  const focusedNodes = viewMode === 'focused'
    ? graph.nodes.filter(node => isNodeInHighlightedPath(node))
    : [];
  const focusedNodeIds = new Set(focusedNodes.map(node => node.id));
  const focusedEdges = viewMode === 'focused'
    ? graph.edges.filter(
      edge =>
        focusedNodeIds.has(edge.from) &&
        focusedNodeIds.has(edge.to) &&
        isEdgeInHighlightedPath(edge),
    )
    : [];
  const renderGraph = viewMode === 'focused'
    ? buildFocusedGraph(focusedNodes, focusedEdges)
    : graph;
  const renderNodeMap = Object.fromEntries(renderGraph.nodes.map(n => [n.id, n]));
  const orderedEdges = [...renderGraph.edges].sort(
    (a, b) => Number(isEdgeInHighlightedPath(a)) - Number(isEdgeInHighlightedPath(b)),
  );
  const orderedNodes = [...renderGraph.nodes].sort((a, b) => {
    const priority = (node: GraphNode) => {
      if (node.id === selectedNodeId) return 2;
      return isNodeInHighlightedPath(node) ? 1 : 0;
    };
    return priority(a) - priority(b);
  });

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
  const totalVh = renderGraph.vh + extraHeight;

  const renderFocusedSummaryCard = (node: GraphNode, isSelected: boolean) => {
    if (viewMode !== 'focused') return null;

    const lines = splitSummaryLines(getFocusedSummaryText(node));
    const height = getSummaryCardHeight(lines);
    const y = node.y - height / 2;
    const isPending = node.summaryStatus === 'PENDING';

    return (
      <g>
        <rect
          x={FOCUSED_SUMMARY_X}
          y={y}
          width={FOCUSED_SUMMARY_WIDTH}
          height={height}
          rx="4"
          fill={isSelected ? '#F4ECD8' : '#FAF4E2'}
          stroke={isSelected ? GRAPH_NODE_COLORS.selected.stroke : GRAPH_NODE_COLORS.default.stroke}
          strokeWidth={isSelected ? '1.6' : '1'}
        />
        <text
          x={FOCUSED_SUMMARY_X + 10}
          y={y + 16}
          fontSize="10"
          fontFamily="var(--body)"
          fontStyle={isPending ? 'italic' : undefined}
          fill={isPending ? GRAPH_NODE_COLORS.deleted.text : GRAPH_NODE_COLORS.default.text}
        >
          {lines.map((line, index) => (
            <tspan key={`${node.id}-summary-${index}`} x={FOCUSED_SUMMARY_X + 10} dy={index === 0 ? 0 : FOCUSED_SUMMARY_LINE_HEIGHT}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
    );
  };

  return (
    <svg
      width={renderGraph.vw * zoom}
      height={totalVh * zoom}
      viewBox={`0 0 ${renderGraph.vw} ${totalVh}`}
      className="block flex-shrink-0"
    >
      <defs>
        <filter id="graph-dim-blur">
          <feGaussianBlur stdDeviation="1.1" />
        </filter>
      </defs>
      {orderedEdges.map(e => {
        const a = renderNodeMap[e.from];
        const b = renderNodeMap[e.to];
        if (!a || !b) return null;
        const isHighlighted = isEdgeInHighlightedPath(e);
        const isDimmed = viewMode === 'structure' && hasHighlight && !isHighlighted;
        return (
          <line
            key={`${e.from}-${e.to}`}
            x1={a.x} y1={a.y} x2={b.x} y2={b.y}
            stroke={isHighlighted ? GRAPH_NODE_COLORS.edge.highlighted : GRAPH_NODE_COLORS.edge.default}
            strokeWidth={isHighlighted ? '2.5' : '1.5'}
            strokeLinecap="round"
            opacity={isDimmed ? 0.22 : 1}
            filter={isDimmed ? 'url(#graph-dim-blur)' : undefined}
          />
        );
      })}
      {upFrontier.map(f => (
        <g key={`up-${f.fromTurnId}`} onClick={() => onExpand?.(f.fromTurnId, 'UP')} style={{ cursor: 'pointer' }}>
          <rect x={ROOT_X - 30} y={4} width={60} height={18} fill="#FAF4E2" stroke="#181410" strokeWidth={1.5} />
          <text x={ROOT_X} y={13} textAnchor="middle" dominantBaseline="middle" fontSize={9} fontWeight={700} letterSpacing="1.5" fill="#7E2018" fontFamily="var(--type)">
            ▲ 더 보기
          </text>
        </g>
      ))}

      {orderedNodes.map(node => {
        const isSelected = node.id === selectedNodeId;
        const isInHighlightedPath = isNodeInHighlightedPath(node) && !isSelected;
        const isDimmed = viewMode === 'structure' && hasHighlight && !isSelected && !isInHighlightedPath;

        if (node.isDeleted) {
          return (
            <g key={node.id} style={{ cursor: onRestore ? 'pointer' : 'default' }}
              onClick={() => node.chatId && onRestore?.(node.chatId)}
              opacity={isDimmed ? 0.28 : 1}
              filter={isDimmed ? 'url(#graph-dim-blur)' : undefined}>
              <rect
                x={node.x - getNodeWidth(node) / 2}
                y={node.y - 14}
                width={getNodeWidth(node)}
                height="28"
                fill={GRAPH_NODE_COLORS.deleted.fill}
                stroke={GRAPH_NODE_COLORS.deleted.stroke}
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <text x={node.x} y={node.y} textAnchor="middle" dominantBaseline="middle"
                fontSize="9" fontWeight="700" fontFamily="var(--type)" fill={GRAPH_NODE_COLORS.deleted.text}>
                {node.label}
              </text>
              <text x={node.x} y={node.y + 16} textAnchor="middle" dominantBaseline="middle"
                fontSize="8" fontFamily="var(--type)" letterSpacing="1.5" fill={GRAPH_NODE_COLORS.deleted.subtext}>
                복구
              </text>
              {renderFocusedSummaryCard(node, isSelected)}
            </g>
          );
        }

        return (
          <g
            key={node.id}
            onClick={() => handleClick(node)}
            style={{ cursor: onNodeClick ? 'pointer' : 'default' }}
            opacity={isDimmed ? 0.28 : 1}
            filter={isDimmed ? 'url(#graph-dim-blur)' : undefined}
          >
            <rect
              x={node.x - getNodeWidth(node) / 2 - 4}
              y={node.y - 18}
              width={getNodeWidth(node) + 8}
              height="36"
              fill="transparent"
            />
            <rect
              x={node.x - getNodeWidth(node) / 2}
              y={node.y - 14}
              width={getNodeWidth(node)}
              height="28"
              fill={nodeFill(node, isSelected, isInHighlightedPath)}
              stroke={nodeStroke(node, isSelected, isInHighlightedPath)}
              strokeWidth={isSelected ? '2.5' : '1.5'}
            />
            <text
              x={node.x} y={node.y}
              textAnchor="middle" dominantBaseline="middle"
              fontSize="9" fontWeight="700"
              fontFamily="var(--type)"
              letterSpacing="1.2"
              fill={nodeTextFill(node, isSelected, isInHighlightedPath)}
            >
              {node.label}
            </text>
            {renderFocusedSummaryCard(node, isSelected)}
          </g>
        );
      })}
      {downFrontier.map(f => (
        <g key={`down-${f.fromTurnId}`} onClick={() => onExpand?.(f.fromTurnId, 'DOWN')} style={{ cursor: 'pointer' }}>
          <rect x={ROOT_X - 30} y={renderGraph.vh + 4} width={60} height={18} fill="#FAF4E2" stroke="#181410" strokeWidth={1.5} />
          <text x={ROOT_X} y={renderGraph.vh + 13} textAnchor="middle" dominantBaseline="middle" fontSize={9} fontWeight={700} letterSpacing="1.5" fill="#7E2018" fontFamily="var(--type)">
            ▼ 더 보기
          </text>
        </g>
      ))}
    </svg>
  );
};

export default GraphPanel;
