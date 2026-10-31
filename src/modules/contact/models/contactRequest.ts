import { z } from 'zod';
import { gentlePathContactStrings as copy } from '@/strings';
import { ContactContextSchema } from './contactContext';

export const ContactRequestSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, copy.validation.name)
      .max(100, copy.validation.name)
      .refine((value) => !/[\r\n]/.test(value), copy.validation.name),
    email: z
      .email(copy.validation.email)
      .trim()
      .max(254, copy.validation.email),
    context: ContactContextSchema,
    message: z
      .string()
      .trim()
      .min(10, copy.validation.message)
      .max(5000, copy.validation.message),
  })
  .strict();
export type ContactRequest = z.infer<typeof ContactRequestSchema>;
