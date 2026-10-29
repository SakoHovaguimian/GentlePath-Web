import { z } from 'zod';
import { PollSchema } from './poll';
import { PollPageMetadataSchema } from './pollPageMetadata';

export const PollPageSchema = z.object({
  data: z.array(PollSchema),
  page: PollPageMetadataSchema,
});
