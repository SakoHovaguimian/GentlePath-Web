import { z } from 'zod';
import { SavedContentTypeSchema } from '../../models/savedContentType';
export const FavoriteTransportSchema = z.object({
  id: z.string().uuid(),
  content_type: SavedContentTypeSchema,
  content_id: z.string().uuid(),
  created_at: z.string().datetime(),
  target: z
    .object({
      id: z.string().uuid(),
      content_type: SavedContentTypeSchema,
      title: z.string().nullable(),
      preview: z.string().max(500).nullable(),
      parent_id: z.string().uuid().nullable(),
      slug: z.string().nullable().optional(),
    })
    .nullish(),
});
export type FavoriteTransport = z.infer<typeof FavoriteTransportSchema>;
