// 그래프 레이아웃 좌표/간격 상수.
export const ROOT_X = 56;
export const ROOT_Y = 40;
export const NODE_Y_GAP = 60;
export const BRANCH_X_GAP = 92;
export const BRANCH_MARKER_Y_GAP = 42;
export const FOCUSED_ROOT_X = 46;
export const FOCUSED_ROOT_Y = 42;
export const FOCUSED_NODE_Y_GAP = 78;
export const FOCUSED_INDENT = 22;
export const FOCUSED_SUMMARY_X = 86;
export const FOCUSED_SUMMARY_WIDTH = 226;
export const FOCUSED_SUMMARY_MIN_HEIGHT = 42;
export const FOCUSED_SUMMARY_LINE_HEIGHT = 12;
export const FOCUSED_SUMMARY_MAX_LINES = 3;
export const FRONTIER_BUTTON_WIDTH = 64;
export const FRONTIER_BUTTON_HEIGHT = 18;
export const FRONTIER_BUTTON_Y_GAP = 30;
export const SUMMARY_PENDING_TEXT = '요약 생성 중...';
export const SUMMARY_EMPTY_TEXT = '요약이 아직 없습니다.';

export const GRAPH_NODE_COLORS = {
  selected: {
    fill: '#111315',
    stroke: '#111315',
    text: '#F6F7F8',
  },
  highlighted: {
    fill: '#666D73',
    stroke: '#303438',
    text: '#F6F7F8',
  },
  branch: {
    fill: '#F6F7F8',
    stroke: '#303438',
    text: '#111315',
  },
  root: {
    fill: '#111315',
    stroke: '#111315',
    text: '#F6F7F8',
  },
  default: {
    fill: '#FFFFFF',
    stroke: '#303438',
    text: '#111315',
  },
  deleted: {
    fill: '#D1D6DA',
    stroke: '#8A9298',
    text: '#8A9298',
    subtext: '#303438',
  },
  edge: {
    default: '#8A9298',
    highlighted: '#303438',
  },
} as const;
