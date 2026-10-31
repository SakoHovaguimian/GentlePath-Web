import { gentlePathApplicationStrings as copy } from '@/strings';
import { z } from 'zod';
import { ApplicationLifecycleSchema as ModelLifecycleSchema } from './applicationLifecycle';
import { ServiceApplicationStatusSchema } from './serviceApplicationStatus';
import { ApplicationDateSchema } from './applicationDate';
import { ApplicationFollowUpSchema } from './applicationFollowUp';

export const ServiceApplicationSchema = ModelLifecycleSchema.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  child_id: z.string().min(1).nullable(),
  title: z
    .string()
    .trim()
    .min(1, copy.validation.title)
    .max(300, copy.validation.limit),
  provider: z.string().trim().max(300),
  benefit_program_key: z.string().trim().min(1).max(100).nullable(),
  benefit_program_name: z
    .string()
    .trim()
    .min(1, copy.validation.title)
    .max(300, copy.validation.limit)
    .nullable(),
  benefit_program_url: z
    .string()
    .url()
    .refine((value) => /^https?:\/\//.test(value))
    .nullable(),
  notes: z.string().trim().max(20000),
  applied_on: ApplicationDateSchema.nullable(),
  reference: z.string().trim().max(300),
  status: ServiceApplicationStatusSchema,
  follow_ups: z.array(ApplicationFollowUpSchema),
});

export const ServiceApplicationCreateSchema = ServiceApplicationSchema.omit({
  id: true,
  user_id: true,
  deleted: true,
  created_at: true,
  updated_at: true,
  follow_ups: true,
});

export const ServiceApplicationUpdateSchema =
  ServiceApplicationCreateSchema.extend({
    expected_updated_at: z.string().datetime(),
  });

export type ServiceApplication = z.infer<typeof ServiceApplicationSchema>;
export type ServiceApplicationCreate = z.infer<
  typeof ServiceApplicationCreateSchema
>;
export type ServiceApplicationUpdate = z.infer<
  typeof ServiceApplicationUpdateSchema
>;
