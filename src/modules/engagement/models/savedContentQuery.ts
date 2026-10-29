import { z } from 'zod';
import { SavedContentTypeSchema } from './savedContentType';
export const SavedContentQuerySchema = z.object({
  query: z.string().trim().max(200).default(''),
  contentType: SavedContentTypeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(12),
  offset: z.coerce.number().int().nonnegative().safe().default(0),
});
export type SavedContentQuery = z.infer<typeof SavedContentQuerySchema>;
