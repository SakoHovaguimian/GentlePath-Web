import { z } from 'zod';
import { gentlePathPortalStrings as copy } from '@/strings';

export const JournalInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, copy.validation.title)
    .max(160, copy.validation.title),
  body: z
    .string()
    .trim()
    .min(1, copy.validation.body)
    .max(20000, copy.validation.body),
  emotion: z.enum(['hopeful', 'calm', 'tired', 'overwhelmed', 'grateful']),
  childId: z.string().nullable().default(null),
});
export const JournalEntrySchema = JournalInputSchema.extend({
  id: z.string(),
  userId: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type JournalEntry = z.infer<typeof JournalEntrySchema>;
export type JournalInput = z.infer<typeof JournalInputSchema>;
