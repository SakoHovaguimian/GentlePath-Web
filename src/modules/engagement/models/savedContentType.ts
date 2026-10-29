import { z } from 'zod';
export const SavedContentTypeSchema = z.enum([
  'RESOURCE',
  'BLOG',
  'GUIDED_STEP',
  'POST',
  'POST_COMMENT',
  'POLL',
  'POLL_COMMENT',
  'TIP',
  'MILESTONE',
]);
export type SavedContentType = z.infer<typeof SavedContentTypeSchema>;
