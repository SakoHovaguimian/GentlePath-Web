import { z } from 'zod';
import { ApplicationLifecycleSchema as ModelLifecycleSchema } from './applicationLifecycle';
import { ApplicationDateSchema } from './applicationDate';

export const ApplicationFollowUpSchema = ModelLifecycleSchema.extend({
  id: z.string().uuid(),
  application_id: z.string().uuid(),
  application_title: z.string(),
  child_id: z.string().min(1).nullable(),
  due_on: ApplicationDateSchema,
  notes: z.string().trim().max(10000),
  completed_at: z.string().datetime().nullable(),
  days_until_due: z.number().int().nullable(),
});

export const ApplicationFollowUpCreateSchema = ApplicationFollowUpSchema.pick({
  due_on: true,
  notes: true,
});

export const ApplicationFollowUpUpdateSchema =
  ApplicationFollowUpCreateSchema.extend({
    expected_updated_at: z.string().datetime(),
  });

export const ApplicationFollowUpCompletionSchema = z.object({
  completed: z.boolean(),
  expected_updated_at: z.string().datetime(),
});

export type ApplicationFollowUp = z.infer<typeof ApplicationFollowUpSchema>;
export type ApplicationFollowUpCreate = z.infer<
  typeof ApplicationFollowUpCreateSchema
>;
export type ApplicationFollowUpUpdate = z.infer<
  typeof ApplicationFollowUpUpdateSchema
>;
export type ApplicationFollowUpCompletion = z.infer<
  typeof ApplicationFollowUpCompletionSchema
>;
