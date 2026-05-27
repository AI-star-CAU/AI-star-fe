/** Phase 4 §3.3 사용량 경고 수준. usageRatio 0.8↑ WARN, 0.95↑ CRITICAL. */
export type WarningLevel = 'NONE' | 'WARN' | 'CRITICAL';

/** Phase 4 §3.3 GET /usage/me 응답 result. */
export interface UsageInfo {
  usageRecordId: number;
  planId: number;
  planName: string;
  periodStart: string;
  periodEnd: string;
  tokensUsed: number;
  /** 0 이면 무제한 plan. */
  tokenLimit: number;
  requestCount: number;
  /** tokenLimit - tokensUsed. 무제한이면 null. */
  remainingTokens: number | null;
  /** tokensUsed / tokenLimit (0~1). 무제한이면 null. */
  usageRatio: number | null;
  warningLevel: WarningLevel;
}
