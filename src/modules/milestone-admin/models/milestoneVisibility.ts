import { z } from 'zod';

export const MilestoneVisibilitySchema = z.enum(['visible', 'hidden', 'all']);
export type MilestoneVisibility = z.infer<typeof MilestoneVisibilitySchema>;
