import { z } from 'zod';

export const PollSelectionModeSchema = z.enum(['SINGLE', 'MULTIPLE']);
export type PollSelectionMode = z.infer<typeof PollSelectionModeSchema>;
