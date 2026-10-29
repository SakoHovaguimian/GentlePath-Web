import { z } from 'zod';
import { gentlePathPortalStrings as copy } from '@/strings';

export const ChildProfileInputSchema = z.object({
  name: z.string().trim().min(1, copy.validation.childName).max(100),
  dateOfBirth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, copy.validation.birthDate)
    .refine(
      (value) =>
        !Number.isNaN(Date.parse(value)) &&
        new Date(value).toISOString().slice(0, 10) === value &&
        Date.parse(value) <= Date.now(),
      copy.validation.birthDate,
    ),
  supportNotes: z.string().trim().max(2000).default(''),
});
export const ChildProfileSchema = ChildProfileInputSchema.extend({
  id: z.string(),
  userId: z.string(),
});
export type ChildProfile = z.infer<typeof ChildProfileSchema>;
export type ChildProfileInput = z.infer<typeof ChildProfileInputSchema>;
