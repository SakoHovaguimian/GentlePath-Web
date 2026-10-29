import { z } from 'zod';
import { gentlePathAccountToolsStrings as copy } from '@/strings';

const tokenCount = z
  .number()
  .int()
  .min(0, copy.validation.tokenCount)
  .max(2147483647, copy.validation.tokenCount)
  .nullable();
export const AIUsageEventInputSchema = z
  .object({
    userId: z.string().uuid(copy.validation.userId).nullable(),
    context: z
      .string()
      .trim()
      .min(1, copy.validation.context)
      .max(500, copy.validation.context),
    inputTokens: tokenCount,
    outputTokens: tokenCount,
    totalTokens: tokenCount,
    metadata: z.record(z.string(), z.unknown()).nullable(),
    error: z.string().max(5000, copy.validation.error).nullable(),
  })
  .strict();
export const AIUsageEventSchema = AIUsageEventInputSchema.extend({
  context: z.string().min(1),
  error: z.string().nullable(),
  id: z.string().uuid(),
  deleted: z.boolean(),
  createdAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
});
export type AIUsageEventInput = z.infer<typeof AIUsageEventInputSchema>;
export type AIUsageEvent = z.infer<typeof AIUsageEventSchema>;
