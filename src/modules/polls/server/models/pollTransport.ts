import { z } from 'zod';
import { PollSelectionModeSchema } from '../../models/pollSelectionMode';
import { PollAuthorTransportSchema } from './pollAuthorTransport';
import { PollOptionTransportSchema } from './pollOptionTransport';
export const PollTransportSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid().nullable(),
  title: z.string(),
  message: z.string(),
  selection_mode: PollSelectionModeSchema,
  tags: z.array(z.string()),
  author: PollAuthorTransportSchema.nullable().optional(),
  options: z.array(PollOptionTransportSchema).optional(),
  participants_count: z.number().int().nonnegative().optional(),
  comments_count: z.number().int().nonnegative().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});
