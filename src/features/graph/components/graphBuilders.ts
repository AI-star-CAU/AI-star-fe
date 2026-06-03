import type { Conversation, Message } from '../../chat/types';
import type { GraphResponse, SummaryStatus } from '../types';
import type { GraphNode, GraphEdge, BuiltGraph } from './graphTypes';
import {
  ROOT_X,
  ROOT_Y,
  NODE_Y_GAP,
  BRANCH_X_GAP,
  BRANCH_MARKER_Y_GAP,
  GRAPH_NODE_COLORS,
} from './graphConstants';

export const getNodeWidth = (node: GraphNode): number =>
  Math.max(34, node.label.length * 6 + 16);

const getUserTurnMessages = (messages: Message[]) =>
  messages.filter(message => !message.isPending && message.role === 'user');

const numericId = (id: string): number => {
  const parsed = Number(id);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
};

export const cleanSummaryText = (value: string | null | undefined): string =>
  value?.replace(/\s+/g, ' ').trim() ?? '';

const getMessageSummary = (message: Message): string => cleanSummaryText(message.content);

const getTurnLabel = (turnSequence: number, summary: string | null, status: SummaryStatus): string => {
  if (turnSequence === 1) return 'root';
  const cleanSummary = cleanSummaryText(summary);
  if (!cleanSummary || status === 'PENDING') return `T${turnSequence}`;
  return cleanSummary.slice(0, 8);
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
      createdAt: message.createdAt,
      depth: 0,
    });
  });

  return mainNodes;
}

export function buildGraph(
  messages: Message[],
  conv: Conversation | undefined,
  branchMessagesById: Record<string, Message[]>,
): BuiltGraph {
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

    const branchPointMessage = branch.branchPointTurnId != null
      ? messages.find(m => m.turnId === branch.branchPointTurnId)
      : undefined;
    const firstBranchMsg = (branchMessagesById[branch.id] ?? [])
      .filter(m => !m.isPending && m.role === 'user')[0];
    const markerCreatedAt = branchPointMessage?.createdAt
      ?? firstBranchMsg?.createdAt
      ?? '';
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
      createdAt: markerCreatedAt,
      depth: branch.depth ?? getBranchDepth(branch.id, branchById, conv?.id),
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
        createdAt: message.createdAt,
        depth: branch.depth ?? getBranchDepth(branch.id, branchById, conv?.id),
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

/**
 * window 절단으로 직접 부모가 보이지 않는 노드에 대해, 가장 가까운 보이는 조상으로
 * 잇는 "backbone" 엣지를 추가한다. 모든 노드는 부모 노드와 엣지로 연결되어야 한다.
 *
 * 규칙:
 *  - turn 노드 (chatId X, sequence N): N-1, N-2 … 1 순으로 같은 chat 의 turn 을 찾고,
 *    없으면 chat X 의 marker, 그것도 없으면 chat X 의 parentChat 의 분기점 이전 turn …
 *    재귀로 root 까지 거슬러 첫 visible 노드를 부모로 잡는다.
 *  - branch marker (chatId X): chat X 의 parentChat 에서 branchPointSeq 이하 turn 중
 *    가장 큰 sequence 의 visible turn → 없으면 parentChat 의 marker → 그 위로 재귀.
 *  - root chat 의 T1 (isRoot): 부모 없음.
 */
function addBackboneEdges(
  graphData: GraphResponse,
  nodes: GraphNode[],
  edges: GraphEdge[],
): GraphEdge[] {
  const chatsById = new Map(graphData.chats.map(c => [c.chatId, c]));
  const seqByTurnId = new Map(graphData.turns.map(t => [t.turnId, t.turnSequence]));

  const turnNodeIdByKey = new Map<string, string>();
  const markerIdByChatId = new Map<number, string>();
  for (const node of nodes) {
    if (node.isBranch && node.chatId) {
      markerIdByChatId.set(Number(node.chatId), node.id);
    } else if (node.turnIndex != null && node.chatId) {
      turnNodeIdByKey.set(`${node.chatId}-${node.turnIndex}`, node.id);
    }
  }

  const hasIncoming = new Set(edges.map(e => e.to));

  function findVisibleAncestor(
    chatId: number,
    beforeSeq: number | null,
  ): { id: string; groupId: string } | null {
    if (beforeSeq != null && beforeSeq >= 1) {
      const cap = beforeSeq;
      for (let k = cap; k >= 1; k--) {
        const id = turnNodeIdByKey.get(`${chatId}-${k}`);
        if (id) return { id, groupId: String(chatId) };
      }
    }
    const markerId = markerIdByChatId.get(chatId);
    if (markerId) return { id: markerId, groupId: String(chatId) };
    const chat = chatsById.get(chatId);
    if (!chat || chat.parentChatId == null) return null;
    const parentBranchPointSeq = chat.branchPointTurnId != null
      ? seqByTurnId.get(chat.branchPointTurnId) ?? null
      : null;
    return findVisibleAncestor(chat.parentChatId, parentBranchPointSeq);
  }

  const extra: GraphEdge[] = [];
  for (const node of nodes) {
    if (node.isRoot) continue;
    if (hasIncoming.has(node.id)) continue;

    let ancestor: { id: string; groupId: string } | null = null;
    if (node.isBranch && node.chatId) {
      const chat = chatsById.get(Number(node.chatId));
      if (chat && chat.parentChatId != null) {
        const bpSeq = chat.branchPointTurnId != null
          ? seqByTurnId.get(chat.branchPointTurnId) ?? null
          : null;
        ancestor = findVisibleAncestor(chat.parentChatId, bpSeq);
      }
    } else if (node.turnIndex != null && node.chatId) {
      // 같은 chat 의 N-1 이하부터 찾는다
      ancestor = findVisibleAncestor(Number(node.chatId), node.turnIndex - 1);
      // 같은 chat 안에 없으면 (turnIndex === 1) marker 로
      if (!ancestor) {
        const markerId = markerIdByChatId.get(Number(node.chatId));
        if (markerId) ancestor = { id: markerId, groupId: node.chatId };
      }
    }

    if (ancestor && ancestor.id !== node.id) {
      extra.push({ from: ancestor.id, to: node.id, groupId: ancestor.groupId });
    }
  }

  return [...edges, ...extra];
}

export function buildGraphFromApiData(graphData: GraphResponse): BuiltGraph {
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
  const turnsByChatId = new Map<number, typeof turns>();
  for (const turn of turns) {
    const existing = turnsByChatId.get(turn.chatId) ?? [];
    existing.push(turn);
    turnsByChatId.set(turn.chatId, existing);
  }
  for (const chatTurns of turnsByChatId.values()) {
    chatTurns.sort((a, b) => a.turnSequence - b.turnSequence);
  }

  const rootTurns = turnsByChatId.get(rootChat.chatId) ?? [];

  rootTurns.forEach((turn, i) => {
    const label = getTurnLabel(turn.turnSequence, turn.summary, turn.summaryStatus);
    const node: GraphNode = {
      id: `turn-${turn.turnId}`,
      x: ROOT_X,
      y: ROOT_Y + i * NODE_Y_GAP,
      label,
      isBranch: false,
      isRoot: turn.turnSequence === 1,
      turnId: turn.turnId,
      turnIndex: turn.turnSequence,
      chatId: String(turn.chatId),
      groupId: String(turn.chatId),
      summary: turn.summary,
      summaryStatus: turn.summaryStatus,
      createdAt: turn.createdAt,
      depth: rootChat.depth ?? 0,
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
    const parentMarker = chat.parentChatId != null
      ? nodes.find(node => node.id === `branch-marker-${chat.parentChatId}`)
      : undefined;
    const parentTurns = chat.parentChatId != null
      ? nodes.filter(node => node.chatId === String(chat.parentChatId) && !node.isBranch)
      : [];
    const parentAnchor = branchPointNode
      ?? parentTurns[0]
      ?? parentMarker;
    const startY = parentAnchor ? parentAnchor.y + BRANCH_MARKER_Y_GAP : ROOT_Y;
    const branchTurns = turnsByChatId.get(chat.chatId) ?? [];

    const markerId = `branch-marker-${chat.chatId}`;
    // 대화 보기 시간순 정렬용 createdAt:
    //   1순위 — 부모의 branchPoint turn 의 createdAt (분기가 일어난 시점)
    //   2순위 — 이 분기의 첫 turn 의 createdAt
    //   3순위 — chat.updatedAt (둘 다 window 밖일 때 fallback)
    const firstBranchTurn = branchTurns[0];
    const markerCreatedAt = (chat.branchPointTurnId != null
      && turns.find(t => t.turnId === chat.branchPointTurnId)?.createdAt)
      || firstBranchTurn?.createdAt
      || chat.updatedAt;
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
      createdAt: markerCreatedAt,
      depth: chat.depth,
    });
    if (branchPointNode) {
      edges.push({ from: branchPointNode.id, to: markerId, groupId: String(chat.chatId) });
    }

    branchTurns.forEach((turn, i) => {
      const label = getTurnLabel(turn.turnSequence, turn.summary, turn.summaryStatus);
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
        summary: turn.summary,
        summaryStatus: turn.summaryStatus,
        createdAt: turn.createdAt,
        depth: chat.depth,
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
  const edgesWithBackbone = addBackboneEdges(graphData, nodes, edges);
  return { nodes, edges: edgesWithBackbone, vw, vh };
}

// 모던 에디토리얼 그래프 팔레트.
// root/active: 블랙 채움 / branch: 페이퍼 + 차콜 보더
// hover path: 미드그레이 강조 / 일반 turn: 화이트 + 차콜 보더
export function nodeFill(n: GraphNode, isSelected: boolean, isInHighlightedPath: boolean): string {
  if (isSelected) return GRAPH_NODE_COLORS.selected.fill;
  if (isInHighlightedPath) return GRAPH_NODE_COLORS.highlighted.fill;
  if (n.isBranch) return GRAPH_NODE_COLORS.branch.fill;
  if (n.isRoot) return GRAPH_NODE_COLORS.root.fill;
  return GRAPH_NODE_COLORS.default.fill;
}
export function nodeStroke(n: GraphNode, isSelected: boolean, isInHighlightedPath: boolean): string {
  if (isSelected) return GRAPH_NODE_COLORS.selected.stroke;
  if (isInHighlightedPath) return GRAPH_NODE_COLORS.highlighted.stroke;
  if (n.isBranch) return GRAPH_NODE_COLORS.branch.stroke;
  if (n.isRoot) return GRAPH_NODE_COLORS.root.stroke;
  return GRAPH_NODE_COLORS.default.stroke;
}
export function nodeTextFill(n: GraphNode, isSelected: boolean, isInHighlightedPath: boolean): string {
  if (isSelected) return GRAPH_NODE_COLORS.selected.text;
  if (isInHighlightedPath) return GRAPH_NODE_COLORS.highlighted.text;
  if (n.isBranch) return GRAPH_NODE_COLORS.branch.text;
  if (n.isRoot) return GRAPH_NODE_COLORS.root.text;
  return GRAPH_NODE_COLORS.default.text;
}
