import { z } from 'zod';

export const ChatMessageQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).default(25),
  offset: z.number().int().nonnegative().safe().default(0),
});
export type ChatMessageQuery = z.infer<typeof ChatMessageQuerySchema>;
