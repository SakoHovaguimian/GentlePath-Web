import { z } from 'zod';
import { gentlePathPortalStrings as copy } from '@/strings';

export const JournalEmotionSchema = z
  .string()
  .trim()
  .min(1, copy.validation.emotions)
  .max(80, copy.validation.emotions);
export const JournalEmotionsSchema = z
  .array(JournalEmotionSchema)
  .max(20, copy.validation.emotions)
  .refine((emotions) => new Set(emotions).size === emotions.length, {
    message: copy.validation.emotions,
  });
export type JournalEmotion = z.infer<typeof JournalEmotionSchema>;
