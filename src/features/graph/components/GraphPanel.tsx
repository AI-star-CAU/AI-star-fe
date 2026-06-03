import React, { useMemo, useState } from 'react';
import type { Conversation, Message } from '../../chat/types';
import type { GraphResponse, GraphViewMode, NodeAction } from '../types';
import type { GraphNode, GraphEdge } from './graphTypes';
import {
  ROOT_X,
  ROOT_Y,
  FRONTIER_BUTTON_WIDTH,
  FRONTIER_BUTTON_HEIGHT,
  FRONTIER_BUTTON_Y_GAP,
  FOCUSED_SUMMARY_X,
  FOCUSED_SUMMARY_WIDTH,
  FOCUSED_SUMMARY_LINE_HEIGHT,
  GRAPH_NODE_COLORS,
} from './graphConstants';
import {
  getNodeWidth,
  buildGraph,
  buildGraphFromApiData,
  nodeFill,
  nodeStroke,
  nodeTextFill,
} from './graphBuilders';
import {
  buildFocusedGraph,
  getFocusedSummaryText,
  splitSummaryLines,
  getSummaryCardHeight,
} from './graphLayout';

interface GraphPanelProps {
  messages: Message[];
  conv: Conversation | undefined;
  branchMessagesById?: Record<string, Message[]>;
  activeId?: string;
  onNodeClick?: (action: NodeAction) => void;
  graphData?: GraphResponse;
  onExpand?: (fromTurnId: number, direction: 'UP' | 'DOWN') => void;
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
  // 대화 보기에서도 모든 노드/엣지를 그대로 들고 들어간다 (필터링 없음).
  // 클릭/활성 분기에 따라 다른 노드가 사라지지 않아야 한다는 요구사항.
  const renderGraph = viewMode === 'focused'
    ? buildFocusedGraph(graph.nodes, graph.edges)
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
  const getFrontierNode = (fromTurnId: number) => renderNodeMap[`turn-${fromTurnId}`];
  const upFrontierControls = upFrontier.map((f, index) => {
    const node = getFrontierNode(f.fromTurnId);
    return {
      key: `up-${f.fromTurnId}-${index}`,
      fromTurnId: f.fromTurnId,
      direction: 'UP' as const,
      x: node?.x ?? ROOT_X,
      y: Math.max(4, (node?.y ?? ROOT_Y) - FRONTIER_BUTTON_Y_GAP - FRONTIER_BUTTON_HEIGHT / 2),
    };
  });
  const downFrontierControls = downFrontier.map((f, index) => {
    const node = getFrontierNode(f.fromTurnId);
    return {
      key: `down-${f.fromTurnId}-${index}`,
      fromTurnId: f.fromTurnId,
      direction: 'DOWN' as const,
      x: node?.x ?? ROOT_X,
      y: (node?.y ?? renderGraph.vh) + FRONTIER_BUTTON_Y_GAP,
    };
  });
  const frontierControls = [...upFrontierControls, ...downFrontierControls];
  const totalVh = Math.max(
    renderGraph.vh,
    ...frontierControls.map(control => control.y + FRONTIER_BUTTON_HEIGHT + 8),
    80,
  );

  // 대화 보기 요약 카드 lane x: 모든 노드의 max x + 여백.
  // 깊은 분기 노드가 카드 위에 얹히지 않도록 노드들 오른쪽 끝 너머에 정렬한다.
  const focusedCardX = viewMode === 'focused'
    ? Math.max(
        FOCUSED_SUMMARY_X,
        ...renderGraph.nodes.map(n => n.x + getNodeWidth(n) / 2 + 16),
      )
    : FOCUSED_SUMMARY_X;
  const focusedTotalVw = viewMode === 'focused'
    ? Math.max(renderGraph.vw, focusedCardX + FOCUSED_SUMMARY_WIDTH + 24)
    : renderGraph.vw;

  const renderFocusedSummaryCard = (node: GraphNode, isSelected: boolean) => {
    if (viewMode !== 'focused') return null;

    const lines = splitSummaryLines(getFocusedSummaryText(node));
    const height = getSummaryCardHeight(lines);
    const y = node.y - height / 2;
    const isPending = node.summaryStatus === 'PENDING';

    return (
      <g>
        <rect
          x={focusedCardX}
          y={y}
          width={FOCUSED_SUMMARY_WIDTH}
          height={height}
          rx="4"
          fill={isSelected ? '#EEF0F2' : '#FFFFFF'}
          stroke={isSelected ? GRAPH_NODE_COLORS.selected.stroke : GRAPH_NODE_COLORS.default.stroke}
          strokeWidth={isSelected ? '1.6' : '1'}
        />
        <text
          x={focusedCardX + 10}
          y={y + 16}
          fontSize="10"
          fontFamily="var(--body)"
          fontStyle={isPending ? 'italic' : undefined}
          fill={isPending ? GRAPH_NODE_COLORS.deleted.text : GRAPH_NODE_COLORS.default.text}
        >
          {lines.map((line, index) => (
            <tspan key={`${node.id}-summary-${index}`} x={focusedCardX + 10} dy={index === 0 ? 0 : FOCUSED_SUMMARY_LINE_HEIGHT}>
              {line}
            </tspan>
          ))}
        </text>
      </g>
    );
  };

  const renderFrontierControl = (control: typeof frontierControls[number]) => (
    <g
      key={control.key}
      onClick={() => onExpand?.(control.fromTurnId, control.direction)}
      style={{ cursor: 'pointer' }}
    >
      <rect
        x={control.x - FRONTIER_BUTTON_WIDTH / 2}
        y={control.y}
        width={FRONTIER_BUTTON_WIDTH}
        height={FRONTIER_BUTTON_HEIGHT}
        fill="#F6F7F8"
        stroke="#111315"
        strokeWidth={1.5}
      />
      <text
        x={control.x}
        y={control.y + FRONTIER_BUTTON_HEIGHT / 2}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={9}
        fontWeight={700}
        letterSpacing="1.2"
        fill="#303438"
        fontFamily="var(--type)"
      >
        더 보기
      </text>
    </g>
  );

  return (
    <svg
      width={focusedTotalVw * zoom}
      height={totalVh * zoom}
      viewBox={`0 0 ${focusedTotalVw} ${totalVh}`}
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
      {upFrontierControls.map(renderFrontierControl)}

      {orderedNodes.map(node => {
        const isSelected = node.id === selectedNodeId;
        const isInHighlightedPath = isNodeInHighlightedPath(node) && !isSelected;
        const isDimmed = viewMode === 'structure' && hasHighlight && !isSelected && !isInHighlightedPath;

        if (node.isDeleted) {
          return (
            <g key={node.id}
              style={{ cursor: 'default' }}
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
                삭제됨
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
      {downFrontierControls.map(renderFrontierControl)}
    </svg>
  );
};

export default GraphPanel;
