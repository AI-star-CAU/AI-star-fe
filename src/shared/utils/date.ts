const MINUTE_MS = 60_000;
const HOUR_MS = MINUTE_MS * 60;
const DAY_MS = HOUR_MS * 24;

export const TIME = { MINUTE_MS, HOUR_MS, DAY_MS } as const;

export function formatRelativeDate(iso: string, now: number): string {
  if (now === 0) return '방금 전';

  const diff = Math.max(0, now - new Date(iso).getTime());
  if (diff < HOUR_MS) return `${Math.floor(diff / MINUTE_MS)}분 전`;
  if (diff < DAY_MS) return `${Math.floor(diff / HOUR_MS)}시간 전`;
  return `${Math.floor(diff / DAY_MS)}일 전`;
}
