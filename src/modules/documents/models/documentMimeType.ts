import { z } from 'zod';
import { gentlePathDocumentStrings as copy } from '@/strings';

export const DocumentMimeTypeSchema = z.enum(
  ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  { error: copy.validation.fileTypeDescription },
);
export type DocumentMimeType = z.infer<typeof DocumentMimeTypeSchema>;
