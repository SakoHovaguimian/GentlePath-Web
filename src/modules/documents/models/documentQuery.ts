import { z } from 'zod';
import { DocumentTypeSchema } from './documentType';

export const DocumentQuerySchema = z
  .object({
    query: z.string().trim().max(200).default(''),
    documentType: DocumentTypeSchema.optional(),
    childId: z.string().min(1).max(100).optional(),
    personalOnly: z.boolean().default(false),
    limit: z.coerce.number().int().min(1).max(100).default(9),
    offset: z.coerce
      .number()
      .int()
      .min(0)
      .max(Number.MAX_SAFE_INTEGER)
      .default(0),
  })
  .refine((input) => !input.childId || !input.personalOnly);
export type DocumentQuery = z.infer<typeof DocumentQuerySchema>;
