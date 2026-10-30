import { z } from 'zod';
import { gentlePathBlogBuilderStrings as copy } from '@/strings';
import { BlogContentTypeSchema } from './blogContentType';
import { StoredBlogMetadataSchema } from './storedBlogMetadata';

export const StoredBlogContentSchema = z
  .object({
    id: z.string().uuid(),
    contentType: BlogContentTypeSchema,
    metaData: StoredBlogMetadataSchema,
  })
  .passthrough();
export type StoredBlogContent = z.infer<typeof StoredBlogContentSchema>;
export const StoredBlogContentsSchema = z
  .array(StoredBlogContentSchema)
  .max(100, copy.tooManyBlocks);
