import { z } from 'zod';
import { gentlePathPortalStrings as copy } from '@/strings';

export const ChildGenderSchema = z.enum(
  ['FEMALE', 'MALE', 'NON_BINARY', 'OTHER', 'PREFER_NOT_TO_SAY'],
  { error: copy.validation.childGender },
);

export type ChildGender = z.infer<typeof ChildGenderSchema>;
