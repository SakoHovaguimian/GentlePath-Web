import { z } from 'zod';
import { gentlePathPollStrings as copy } from '@/strings';

export const PollOptionInputSchema = z
  .object({
    id: z.string().uuid().optional(),
    text: z
      .string()
      .trim()
      .min(1, copy.validation.optionDescription)
      .max(500, copy.validation.optionDescription),
  })
  .strict();
export const PollOptionSchema = z.object({
  id: z.string().uuid(),
  pollId: z.string().uuid(),
  text: z.string(),
  position: z.number().int().nonnegative(),
  selectionsCount: z.number().int().nonnegative(),
});
export type PollOptionInput = z.infer<typeof PollOptionInputSchema>;
export type PollOption = z.infer<typeof PollOptionSchema>;
