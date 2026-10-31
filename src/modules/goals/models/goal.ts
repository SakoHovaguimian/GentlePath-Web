import { ChildProfileSchema } from '@/modules/portal/models/childProfile';
import { z } from 'zod';
import { gentlePathGoalStrings as copy } from '@/strings';
import { GoalStatusSchema } from './goalStatus';
import { GoalMediaSchema } from './goalMedia';
import { GoalNoteSchema } from './goalNote';

const ModelLifecycleSchema = z.object({
  created_at: z.string().datetime().nullable(),
  updated_at: z.string().datetime().nullable(),
  deleted: z.boolean(),
});

export const GoalSchema = ModelLifecycleSchema.extend({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  child_id: ChildProfileSchema.shape.id.min(1),
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(20000),
  status: GoalStatusSchema,
  cover_media_id: z.string().uuid().nullable(),
  completed_at: z.string().datetime().nullable(),
  media: z.array(GoalMediaSchema).max(10),
  notes: z.array(GoalNoteSchema),
});

export const GoalInputSchema = GoalSchema.pick({
  child_id: true,
  title: true,
  description: true,
  status: true,
  cover_media_id: true,
})
  .extend({
    description: GoalSchema.shape.description.default(''),
    status: GoalStatusSchema.default('ACTIVE'),
    cover_media_id: GoalSchema.shape.cover_media_id.default(null),
    media_ids: z.array(z.string().uuid()).max(10).default([]),
  })
  .strict()
  .refine((input) => new Set(input.media_ids).size === input.media_ids.length, {
    message: copy.invalidAttachment,
    path: ['media_ids'],
  })
  .refine(
    (input) =>
      !input.cover_media_id || input.media_ids.includes(input.cover_media_id),
    {
      message: copy.invalidAttachment,
      path: ['cover_media_id'],
    },
  );

export type Goal = z.infer<typeof GoalSchema>;
export type GoalInput = z.infer<typeof GoalInputSchema>;
