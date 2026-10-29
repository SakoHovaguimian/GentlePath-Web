import { z } from 'zod';

export const CommunityAuthorTransportSchema = z.object({
  id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
});
export type CommunityAuthorTransport = z.infer<
  typeof CommunityAuthorTransportSchema
>;
