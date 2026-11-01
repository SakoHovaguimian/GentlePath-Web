import { z } from 'zod';

export const PostKindSchema = z.enum([
  'DISCUSSION',
  'QUESTION',
  'EXPERIENCE',
  'WIN',
]);
export type PostKind = z.infer<typeof PostKindSchema>;
