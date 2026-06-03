import { z } from 'zod';
import { TitleStatusSchema } from '../../../shared/api/schemas';

export const CreateBranchResponseSchema = z.object({
  chatId: z.number(),
  rootChatId: z.number(),
  parentId: z.number(),
  branchPointTurnId: z.number(),
  title: z.string().nullable(),
  titleStatus: TitleStatusSchema,
  llmProvider: z.string(),
  llmModel: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
