import type { Branch } from '../branch/types';
import type { Conversation } from '../chat/types';

export type SearchMatchKind = 'conversation' | 'branch';

export interface SearchHit {
  kind: SearchMatchKind;
  /** 화면에 표시할 텍스트 (대화 제목 또는 분기 제목). */
  label: string;
  /** 클릭 시 라우팅할 대화/분기 id. */
  targetId: string;
  /** 부모 대화 — 분기인 경우 어디에 속하는지 보여주기 위함. */
  parentConversation: Conversation;
  /** 분기 hit 인 경우만 채워짐. */
  branch?: Branch;
  /** 추가 미리보기(있으면). */
  preview?: string;
}
