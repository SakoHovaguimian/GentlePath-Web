import { z } from 'zod';
import { ChildSupportDetailsTransportSchema } from './childSupportDetailsTransport';
import { ChildGenderSchema } from '@/modules/portal/models/childGender';

export const ChildProfileTransportSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  name: z.string(),
  date_of_birth: z.string(),
  gender: ChildGenderSchema.nullable(),
  support_notes: z.string(),
  support_details: ChildSupportDetailsTransportSchema,
});

export type ChildProfileTransport = z.infer<typeof ChildProfileTransportSchema>;
