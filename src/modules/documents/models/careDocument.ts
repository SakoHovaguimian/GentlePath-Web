import { z } from 'zod';
import { gentlePathDocumentStrings as copy } from '@/strings';
import { DocumentTypeSchema } from './documentType';
import { DocumentMimeTypeSchema } from './documentMimeType';

export const CareDocumentSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  childId: z.string().min(1).nullable(),
  title: z
    .string()
    .trim()
    .min(1, copy.validation.titleDescription)
    .max(300, copy.validation.titleDescription),
  documentType: DocumentTypeSchema,
  fileName: z.string().min(1).max(300),
  mimeType: DocumentMimeTypeSchema,
  sizeBytes: z.number().int().positive(),
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
export type CareDocument = z.infer<typeof CareDocumentSchema>;
export const DocumentMetadataInputSchema = CareDocumentSchema.pick({
  title: true,
  documentType: true,
  childId: true,
}).strict();
export type DocumentMetadataInput = z.infer<typeof DocumentMetadataInputSchema>;
