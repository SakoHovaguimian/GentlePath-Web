import { z } from 'zod';
import { gentlePathPollStrings as copy } from '@/strings';

export const PollBallotInputSchema = z
  .object({
    optionIds: z
      .array(z.string().uuid())
      .min(1, copy.validation.ballotDescription)
      .max(100, copy.validation.ballotDescription)
      .refine(
        (ids) => new Set(ids).size === ids.length,
        copy.validation.ballotDescription,
      ),
  })
  .strict();
export const PollBallotSchema = z.object({
  id: z.string().uuid(),
  pollId: z.string().uuid(),
  userId: z.string().uuid(),
  optionIds: z.array(z.string().uuid()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PollBallot = z.infer<typeof PollBallotSchema>;
export type PollBallotInput = z.infer<typeof PollBallotInputSchema>;
