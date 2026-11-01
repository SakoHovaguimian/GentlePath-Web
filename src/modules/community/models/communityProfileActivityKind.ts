import { z } from 'zod';

export const CommunityProfileActivityKindSchema = z.enum([
  'posts',
  'polls',
  'tips',
  'post_comments',
  'poll_comments',
]);
export type CommunityProfileActivityKind = z.infer<
  typeof CommunityProfileActivityKindSchema
>;
