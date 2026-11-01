import { CommunityPublicMetadataSchema } from '@/modules/community/models/communityPublicMetadata';
import { z } from 'zod';
import { SavedContentTypeSchema } from './savedContentType';
export const SavedContentTargetSchema = CommunityPublicMetadataSchema.extend({
  id: z.string(),
  contentType: SavedContentTypeSchema,
  title: z.string().nullable(),
  preview: z.string().max(500).nullable(),
  parentId: z.string().nullable(),
  readerPath: z.string().nullable(),
});
export type SavedContentTarget = z.infer<typeof SavedContentTargetSchema>;
