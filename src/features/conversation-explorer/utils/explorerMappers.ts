import type { Branch } from '../../branch/types';
import type { Conversation } from '../../chat/types';
import type { ExplorerNode, ExplorerPage, ExplorerTree } from '../types';

/**
 * Phase 4 §2.1 탐색기 노드 → 사이드바가 쓰는 Branch 모델로 변환.
 * 탐색기는 turn 인덱스를 주지 않으므로 `forkAtTurnIndex` 는 0(미상)으로 둔다.
 * 활성 분기의 정확한 fork 위치는 ChatLayout 이 chatMeta.branchPointTurnId 로 재계산한다.
 */
function toBranch(node: ExplorerNode): Branch {
  return {
    id: String(node.chatId),
    parentConvId: String(node.parentChatId),
    title: node.title ?? '새 분기',
    forkAtTurnIndex: 0,
    depth: node.depth,
    branchPointTurnId: node.branchPointTurnId,
  };
}

function previewOf(node: ExplorerNode): string {
  return node.turnCount > 0
    ? `${node.turnCount}개의 턴`
    : '아직 메시지가 없습니다.';
}

/** ExplorerTree 한 그루 → root Conversation(하위 분기 포함). */
export function mapExplorerTreeToConversation(tree: ExplorerTree): Conversation {
  const root = tree.nodes[0];
  const branches = tree.nodes.slice(1).map(toBranch);

  return {
    id: String(root.chatId),
    title: root.title ?? '제목없음',
    preview: previewOf(root),
    createdAt: root.createdAt,
    turnCount: root.turnCount,
    lastMessageAt: root.lastActivityAt,
    llmProvider: root.llmProvider,
    llmModel: root.llmModel,
    branches,
  };
}

/** 탐색기 페이지 응답 전체를 사이드바용 Conversation[] 로 평탄화(정렬 순서 유지). */
export function mapExplorerPageToConversations(page: ExplorerPage): Conversation[] {
  return page.roots
    .filter(tree => tree.nodes.length > 0)
    .map(mapExplorerTreeToConversation);
}
