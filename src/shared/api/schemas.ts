import { z } from 'zod';

/**
 * BE 명세 §0.3: 모든 응답은 ApiResponse<T> 단일 래퍼.
 * 모든 feature 가 공유하는 공통 envelope 이므로 shared/api 에 둔다.
 */
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

/** 제목 상태 enum. branch/graph/conversation-explorer 가 공통으로 사용한다. */
export const TitleStatusSchema = z.enum(['PENDING', 'GENERATED', 'USER_EDITED']);

/** 턴 요약 상태 enum. */
export const SummaryStatusSchema = z.enum(['PENDING', 'GENERATED']);
