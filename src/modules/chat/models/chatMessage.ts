import { z } from 'zod';
import { strings } from '@/strings';
export const ChatMessageSchema = z.object({
  id: z.string().uuid(),
  userId: z.string(),
  author: z.string(),
  message: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  deleted: z.boolean().optional(),
});
export const ChatMessageInputSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, strings.errors.invalidInput)
    .max(2000, strings.errors.invalidInput),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
