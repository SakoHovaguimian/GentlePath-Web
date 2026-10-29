import { z } from 'zod';
import { DocumentMimeTypeSchema } from './documentMimeType';
import { DocumentTypeSchema } from './documentType';

export const DocumentTransportSchema = z.object({
  id: z.string().min(1),
  user_id: z.string().min(1),
  child_id: z.string().nullable(),
  title: z.string(),
  document_type: DocumentTypeSchema,
  file_name: z.string(),
  mime_type: DocumentMimeTypeSchema,
  size_bytes: z.number().int().positive(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
});
export type DocumentTransport = z.infer<typeof DocumentTransportSchema>;
