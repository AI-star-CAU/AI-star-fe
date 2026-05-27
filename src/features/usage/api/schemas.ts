import { z } from 'zod';
import { apiEnvelope } from '../../graph/api/schemas';

export { apiEnvelope };

export const WarningLevelSchema = z.enum(['NONE', 'WARN', 'CRITICAL']);

export const UsageInfoSchema = z.object({
  usageRecordId: z.number(),
  planId: z.number(),
  planName: z.string(),
  periodStart: z.string(),
  periodEnd: z.string(),
  tokensUsed: z.number(),
  tokenLimit: z.number(),
  requestCount: z.number(),
  remainingTokens: z.number().nullable(),
  usageRatio: z.number().nullable(),
  warningLevel: WarningLevelSchema,
});
