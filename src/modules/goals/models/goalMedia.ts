import { ChildProfileSchema } from '@/modules/portal/models/childProfile';
import { z } from 'zod';
import { GoalMediaMimeTypeSchema } from './goalMediaMimeType';

export const GoalMediaSchema = z.object({
  id: z.string().uuid(),
  goal_id: z.string().uuid().nullable(),
  user_id: z.string().uuid(),
  child_id: ChildProfileSchema.shape.id.min(1),
  upload_session_id: z.string().uuid(),
  original_file_name: z.string(),
  mime_type: GoalMediaMimeTypeSchema,
  size_bytes: z.number().int().positive(),
  position: z.number().int().nonnegative(),
  created_at: z.string().datetime(),
});

export type GoalMedia = z.infer<typeof GoalMediaSchema>;
