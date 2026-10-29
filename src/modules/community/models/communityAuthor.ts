import { z } from 'zod';

export const CommunityAuthorSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});
export type CommunityAuthor = z.infer<typeof CommunityAuthorSchema>;
