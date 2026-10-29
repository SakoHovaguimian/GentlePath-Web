import { z } from 'zod';
export const PollOptionTransportSchema = z.object({
  id: z.string().uuid(),
  poll_id: z.string().uuid(),
  option_text: z.string(),
  position: z.number().int().nonnegative(),
  deleted: z.boolean(),
  selections_count: z.number().int().nonnegative().optional(),
});
