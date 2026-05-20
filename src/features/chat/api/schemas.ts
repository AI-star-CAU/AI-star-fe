import { z } from 'zod';

export const MessageStatusSchema = z.enum(['STREAMING', 'COMPLETED', 'CANCELED', 'FAILED']);
export const SenderTypeSchema = z.enum(['USER', 'ASSISTANT']);
export const LlmProviderSchema = z.enum(['OPENAI', 'GOOGLE', 'ANTHROPIC']);
export const LlmModelSchema = z.enum(['gpt-4o-mini', 'gemini-2.0-flash', 'claude-3.5-sonnet']);

export const ChatMessageResponseSchema = z.object({
  messageId: z.number(),
  senderType: SenderTypeSchema,
  status: MessageStatusSchema,
  content: z.string().nullable(),
  promptToken: z.number().nullable(),
  answerToken: z.number().nullable(),
  createdAt: z.string(),
});

export const TurnListItemResponseSchema = z.object({
  turnId: z.number(),
  turnSequence: z.number(),
  summary: z.string().nullable(),
  summaryStatus: z.enum(['PENDING', 'GENERATED']).optional(),
  messages: z.array(ChatMessageResponseSchema),
  createdAt: z.string(),
});

export const TurnPageResponseSchema = z.object({
  turns: z.array(TurnListItemResponseSchema),
  nextTurnSequence: z.number().nullable(),
  hasMore: z.boolean(),
});

export const ChatListItemResponseSchema = z.object({
  chatId: z.number(),
  title: z.string().nullable(),
  lastMessagePreview: z.string().nullable(),
  turnCount: z.number(),
  lastMessageAt: z.string().nullable(),
  llmProvider: z.string(),
  llmModel: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CreateChatResponseSchema = z.object({
  chatId: z.number(),
  rootChatId: z.number(),
  parentId: z.number().nullable(),
  branchPointTurnId: z.number().nullable().optional(),
  title: z.string().nullable(),
  titleStatus: z.enum(['PENDING', 'GENERATED', 'USER_EDITED']).optional(),
  llmProvider: LlmProviderSchema,
  llmModel: LlmModelSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const CancelMessageResponseSchema = z.object({
  messageId: z.number(),
  status: MessageStatusSchema,
  content: z.string().nullable(),
  answerToken: z.number().nullable(),
});

export const apiEnvelope = <T extends z.ZodTypeAny>(resultSchema: T) =>
  z.object({
    isSuccess: z.boolean(),
    code: z.string(),
    message: z.string(),
    result: resultSchema,
  });

/** 명세 §0.7 / §2.2: Spring Page<T> 형태의 Offset 페이징 응답. */
export const pageResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    content: z.array(itemSchema),
    page: z.number(),
    size: z.number(),
    totalElements: z.number(),
    totalPages: z.number(),
  });
