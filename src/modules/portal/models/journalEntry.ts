import { z } from 'zod';
import { gentlePathPortalStrings as copy } from '@/strings';
import { JournalEmotionsSchema } from './journalEmotion';

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
  emotions: JournalEmotionsSchema,
  childId: z.string().nullable().default(null),
});
export const JournalEntrySchema = JournalInputSchema.extend({
  id: z.string(),
  userId: z.string(),
  // Existing API records can contain feelings without a message or timestamps.
  body: z.string(),
  createdAt: z.string().datetime().nullable(),
  updatedAt: z.string().datetime().nullable(),
});
export type JournalEntry = z.infer<typeof JournalEntrySchema>;
export type JournalInput = z.infer<typeof JournalInputSchema>;
