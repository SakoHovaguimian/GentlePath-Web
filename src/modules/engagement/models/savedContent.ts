import { z } from 'zod';
import { SavedContentTypeSchema } from './savedContentType';
import { SavedContentTargetSchema } from './savedContentTarget';
export const SavedContentSchema = z.object({
  id: z.string(),
  contentType: SavedContentTypeSchema,
  contentId: z.string(),
  createdAt: z.string().datetime(),
  target: SavedContentTargetSchema.nullable(),
});
export type SavedContent = z.infer<typeof SavedContentSchema>;
