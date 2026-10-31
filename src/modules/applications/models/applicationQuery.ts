import { z } from 'zod';
import { ApplicationPriorityQuerySchema } from './applicationPriorityQuery';
import { ServiceApplicationStatusSchema } from './serviceApplicationStatus';

export const ApplicationQuerySchema = ApplicationPriorityQuerySchema.extend({
  query: z.string().trim().max(500).default(''),
  child_id: z.string().min(1).optional(),
  personal_only: z.boolean().default(false),
  status: ServiceApplicationStatusSchema.optional(),
}).refine((value) => !value.child_id || !value.personal_only);

export type ApplicationQuery = z.infer<typeof ApplicationQuerySchema>;
