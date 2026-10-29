import { z } from 'zod';

export const PollAuthorSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string(),
  lastName: z.string(),
});
export type PollAuthor = z.infer<typeof PollAuthorSchema>;
