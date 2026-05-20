const DEFAULT_MAX_TITLE_LENGTH = 40;

export function deriveChatTitle(
  content: string,
  fallback = 'New chat',
  maxLength = DEFAULT_MAX_TITLE_LENGTH,
): string {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (!normalized) return fallback;
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}
