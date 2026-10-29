import { z } from 'zod';

export const AIUsageTransportSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullish(),
  ai_context_type: z.string().min(1),
  input_tokens: z.number().int().nonnegative().nullish(),
  output_tokens: z.number().int().nonnegative().nullish(),
  total_tokens: z.number().int().nonnegative().nullish(),
  metadata: z.record(z.string(), z.unknown()).nullish(),
  error: z.string().nullish(),
  deleted: z.boolean().nullable().default(false),
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
});
export type AIUsageTransport = z.infer<typeof AIUsageTransportSchema>;
