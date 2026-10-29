import { z } from 'zod';
import { DocumentMimeTypeSchema } from './documentMimeType';
import { documentMaxSizeBytes } from '../services/documentFileValidation';

const SignedDocumentDownloadSchema = z.object({
  url: z.url().refine((value) => {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  }),
});
const InlineDocumentDownloadSchema = z.object({
  fileName: z.string().min(1).max(300),
  mimeType: DocumentMimeTypeSchema,
  sizeBytes: z.number().int().positive().max(documentMaxSizeBytes),
  contentBase64: z
    .string()
    .min(4)
    .max(Math.ceil(documentMaxSizeBytes / 3) * 4)
    .regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/),
});
export const DocumentDownloadSchema = z.union([
  SignedDocumentDownloadSchema,
  InlineDocumentDownloadSchema,
]);
export type DocumentDownload = z.infer<typeof DocumentDownloadSchema>;
