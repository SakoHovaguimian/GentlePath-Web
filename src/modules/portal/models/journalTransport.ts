import { z } from 'zod';
import { JournalEmotionsSchema } from './journalEmotion';

export const JournalTransportSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  child_id: z.string().uuid().nullable(),
  title: z.string().nullable().optional(),
  message: z.string().nullable(),
  emotions: JournalEmotionsSchema,
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
});
export type JournalTransport = z.infer<typeof JournalTransportSchema>;
