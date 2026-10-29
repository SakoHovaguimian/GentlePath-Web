import { z } from 'zod';
export const PollAuthorTransportSchema = z.object({
  id: z.string().uuid(),
  first_name: z.string(),
  last_name: z.string(),
});
