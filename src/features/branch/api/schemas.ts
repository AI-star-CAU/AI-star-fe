import { z } from 'zod';

export const TitleStatusSchema = z.enum(['PENDING', 'GENERATED', 'USER_EDITED']);
export const SummaryStatusSchema = z.enum(['PENDING', 'GENERATED']);

export const ChatNodeDtoSchema = z.object({
  chatId: z.number(),
  title: z.string(),
  titleStatus: TitleStatusSchema,
  parentChatId: z.number().nullable(),
  branchPointTurnId: z.number().nullable(),
  depth: z.number(),
  isDeleted: z.boolean(),
  lastTurnId: z.number().nullable(),
  updatedAt: z.string(),
});

export const TurnNodeDtoSchema = z.object({
  turnId: z.number(),
  chatId: z.number(),
  turnSequence: z.number(),
  summary: z.string().nullable(),
  summaryStatus: SummaryStatusSchema,
  isBranchPoint: z.boolean(),
  isCurrent: z.boolean(),
  createdAt: z.string(),
});

export const FrontierPointSchema = z.object({
  fromTurnId: z.number(),
  hasMore: z.boolean(),
});

export const FrontierDtoSchema = z.object({
  up: z.array(FrontierPointSchema),
  down: z.array(FrontierPointSchema),
});

export const CenterDtoSchema = z.object({
  turnId: z.number(),
  chatId: z.number(),
});

export const GraphResponseSchema = z.object({
  rootChatId: z.number(),
  center: CenterDtoSchema.nullable(),
  chats: z.array(ChatNodeDtoSchema),
  turns: z.array(TurnNodeDtoSchema),
  frontier: FrontierDtoSchema,
});

export const ExpandGraphResponseSchema = z.object({
  direction: z.enum(['UP', 'DOWN']),
  turns: z.array(TurnNodeDtoSchema),
  frontier: FrontierDtoSchema,
});

export const CreateBranchResponseSchema = z.object({
  chatId: z.number(),
  rootChatId: z.number(),
  parentId: z.number(),
  branchPointTurnId: z.number(),
  title: z.string(),
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
