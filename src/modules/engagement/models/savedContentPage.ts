import { z } from 'zod';
import { SavedContentSchema } from './savedContent';
import { EngagementPageMetadataSchema } from './engagementPageMetadata';
export const SavedContentPageSchema = z.object({
  data: z.array(SavedContentSchema),
  page: EngagementPageMetadataSchema,
});
export type SavedContentPage = z.infer<typeof SavedContentPageSchema>;
