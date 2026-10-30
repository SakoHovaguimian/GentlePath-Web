import { z } from 'zod';
import { gentlePathPortalStrings as copy } from '@/strings';
import { ChildSupportDetailsSchema } from './childSupportDetails';
import { ChildGenderSchema } from './childGender';

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
  gender: ChildGenderSchema.nullable().default(null),
  supportNotes: z
    .string()
    .trim()
    .max(2000, copy.family.answerLimit)
    .default(''),
  supportDetails: ChildSupportDetailsSchema.default(() =>
    ChildSupportDetailsSchema.parse({}),
  ),
});
export const ChildProfileUpdateSchema = ChildProfileInputSchema.extend({
  gender: ChildGenderSchema.nullable().optional(),
});
export const ChildProfileSchema = ChildProfileInputSchema.extend({
  id: z.string(),
  userId: z.string(),
});
export type ChildProfile = z.infer<typeof ChildProfileSchema>;
export type ChildProfileInput = z.infer<typeof ChildProfileInputSchema>;
