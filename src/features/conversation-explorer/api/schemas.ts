import { z } from 'zod';
import { TitleStatusSchema } from '../../branch/api/schemas';
import { apiEnvelope } from '../../graph/api/schemas';

export { apiEnvelope };

export const ExplorerNodeSchema = z.object({
  chatId: z.number(),
  parentChatId: z.number().nullable(),
  branchPointTurnId: z.number().nullable(),
  title: z.string().nullable(),
  titleStatus: TitleStatusSchema,
  depth: z.number(),
  turnCount: z.number(),
  lastActivityAt: z.string(),
  createdAt: z.string(),
  deletedAt: z.string().nullable(),
  llmProvider: z.string(),
  llmModel: z.string(),
});

export const ExplorerTreeSchema = z.object({
  rootChatId: z.number(),
  nodes: z.array(ExplorerNodeSchema),
});

export const ExplorerPageSchema = z.object({
  roots: z.array(ExplorerTreeSchema),
  page: z.number(),
  size: z.number(),
  totalRootCount: z.number(),
  hasNext: z.boolean(),
});
