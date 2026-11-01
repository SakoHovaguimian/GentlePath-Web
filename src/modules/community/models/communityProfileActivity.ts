import { z } from 'zod';

export const CommunityProfileActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  body: z.string(),
  href: z.string().startsWith('/'),
  createdAt: z.string(),
});
export type CommunityProfileActivity = z.infer<
  typeof CommunityProfileActivitySchema
>;
