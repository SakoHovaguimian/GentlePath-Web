import { z } from 'zod';

export const CommunityFeedPreferenceSchema = z.object({
  hiddenPostIds: z.array(z.string().min(1)).max(1000),
});

export type CommunityFeedPreference = z.infer<
  typeof CommunityFeedPreferenceSchema
>;
