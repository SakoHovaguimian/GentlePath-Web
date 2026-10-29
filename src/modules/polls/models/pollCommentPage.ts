import { z } from 'zod';
import { PollCommentSchema } from './pollComment';
import { PollPageMetadataSchema } from './pollPageMetadata';

export const PollCommentPageSchema = z.object({
  data: z.array(PollCommentSchema),
  page: PollPageMetadataSchema,
});
