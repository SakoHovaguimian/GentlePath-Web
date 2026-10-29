import { z } from 'zod';
export const PollBallotTransportSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  poll_id: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
  selections: z
    .array(z.object({ poll_option_id: z.string().uuid() }))
    .optional(),
});
