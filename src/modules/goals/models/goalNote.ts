import { z } from 'zod';

export const GoalNoteSchema = z.object({
  id: z.string().uuid(),
  goal_id: z.string().uuid(),
  message: z.string().trim().min(1).max(10000),
  occurred_at: z.string().datetime(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const GoalNoteInputSchema = GoalNoteSchema.pick({
  message: true,
  occurred_at: true,
}).strict();

export type GoalNote = z.infer<typeof GoalNoteSchema>;
export type GoalNoteInput = z.infer<typeof GoalNoteInputSchema>;
