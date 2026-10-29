import { z } from 'zod';
import { DocumentTransportSchema } from './documentTransport';
import { DocumentPageSchema } from './documentPage';

export const DocumentTransportPageSchema = z.object({
  data: z.array(DocumentTransportSchema),
  page: DocumentPageSchema.shape.page,
});
export type DocumentTransportPage = z.infer<typeof DocumentTransportPageSchema>;
