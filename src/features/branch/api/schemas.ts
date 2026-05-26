import { z } from 'zod';

export const TitleStatusSchema = z.enum(['PENDING', 'GENERATED', 'USER_EDITED']);

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

export const apiEnvelope = <T extends z.ZodTypeAny>(resultSchema: T) =>
  z.object({
    isSuccess: z.boolean(),
    code: z.string(),
    message: z.string(),
    result: resultSchema,
  });
