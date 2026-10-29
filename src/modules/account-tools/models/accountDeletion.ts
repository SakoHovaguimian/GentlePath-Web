import { z } from 'zod';
import { gentlePathAccountToolsStrings as copy } from '@/strings';

export const AccountDeletionSchema = z
  .object({
    confirmationEmail: z.email(copy.validation.confirmationEmail),
  })
  .strict();
export type AccountDeletion = z.infer<typeof AccountDeletionSchema>;
