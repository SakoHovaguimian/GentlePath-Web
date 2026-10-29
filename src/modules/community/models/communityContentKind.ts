import { z } from 'zod';

export const CommunityContentKindSchema = z.enum([
  'post',
  'post_comment',
  'blog',
  'poll',
  'poll_comment',
  'tip',
  'resource',
  'milestone',
  'guided_step',
]);
export type CommunityContentKind = z.infer<typeof CommunityContentKindSchema>;
