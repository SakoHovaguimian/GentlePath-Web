import { z } from 'zod';
import { SavedContentTypeSchema } from './savedContentType';
export const SavedContentTargetSchema = z.object({
  id: z.string(),
  contentType: SavedContentTypeSchema,
  title: z.string().nullable(),
  preview: z.string().max(500).nullable(),
  parentId: z.string().nullable(),
  readerPath: z.string().nullable(),
});
export type SavedContentTarget = z.infer<typeof SavedContentTargetSchema>;
