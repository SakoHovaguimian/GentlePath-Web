import { z } from 'zod';
import { GoalStatusSchema } from './goalStatus';

export const GoalStatusInputSchema = z
  .object({ status: GoalStatusSchema })
  .strict();
