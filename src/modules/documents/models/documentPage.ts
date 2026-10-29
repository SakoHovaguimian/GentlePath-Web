import { z } from 'zod';
import { CareDocumentSchema } from './careDocument';

export const DocumentPageSchema = z.object({
  data: z.array(CareDocumentSchema),
  page: z.object({
    limit: z.number().int().positive(),
    offset: z.number().int().nonnegative(),
    hasMore: z.boolean(),
    nextOffset: z.number().int().nonnegative().nullable(),
  }),
});
export type DocumentPage = z.infer<typeof DocumentPageSchema>;
